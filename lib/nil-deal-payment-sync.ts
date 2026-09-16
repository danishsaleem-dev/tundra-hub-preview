import "server-only";
import { Prisma, type ContractStatus, type UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/audit-log";

// Shared by the NIL Deal create and update routes — a deal can arrive at
// SIGNED either by being created that way directly or by transitioning
// into it later via PATCH, and both paths owe the same guarantee.
// hasExistingPayment matters on the PATCH path: a deal that's already
// SIGNED with a payment already attached must stay editable even if this
// particular save leaves dealValue null — no new payment would be
// created for it anyway. A brand-new deal from POST never has one yet.
export function assertSignedDealHasPriceable(
  resultingStatus: ContractStatus,
  resultingDealValue: Prisma.Decimal | number | null,
  hasExistingPayment: boolean,
): string | null {
  if (resultingStatus !== "SIGNED" || resultingDealValue !== null || hasExistingPayment) {
    return null;
  }
  return "Cannot mark this deal SIGNED without a dealValue — a Payment record would be created automatically for it, and paymentAmount can't be null. Set dealValue first, then retry.";
}

// Replicates the original Airtable automation: whenever a deal is (or
// becomes) Signed, ensure exactly one Payment exists for it. Keyed on
// existence, not on whether this request is what made it Signed — so a
// deal created already-Signed gets the same auto-payment a deal that
// later transitions to Signed via PATCH does, and re-saving an
// already-Signed deal never creates a second one.
export async function ensureSignedDealHasPayment(
  nilDeal: {
    id: string;
    dealName: string;
    dealValue: Prisma.Decimal | null;
    contractStatus: ContractStatus;
  },
  actor: { id: string; role: UserRole },
): Promise<void> {
  if (nilDeal.contractStatus !== "SIGNED") return;

  const linkedPayment = await prisma.payment.findFirst({ where: { nilDealId: nilDeal.id } });
  if (linkedPayment) return;

  try {
    // dealValue is guaranteed non-null here — assertSignedDealHasPriceable
    // already rejected the only case where it wouldn't be. isAutoCreated:
    // true is what the partial unique index enforces on — this is the one
    // and only Payment allowed to carry it for this deal, at the database
    // level, not just via the findFirst check above.
    const autoPayment = await prisma.payment.create({
      data: {
        paymentName: `${nilDeal.dealName} Payment`,
        nilDealId: nilDeal.id,
        paymentAmount: nilDeal.dealValue!,
        status: "PENDING",
        isAutoCreated: true,
      },
    });

    await logAudit({
      actor,
      action: "CREATE",
      entityType: "PAYMENT",
      entityId: autoPayment.id,
      after: autoPayment,
    });
  } catch (err) {
    // P2002 (unique constraint violation) here means two requests raced
    // past the findFirst check above and both tried to create the
    // auto-payment — the database's partial unique index is the real
    // guarantee, this in-app check is just the common case's fast path.
    // Whichever request loses the race has nothing to do: a payment
    // already exists, which was the whole goal.
    const isRaceOnAutoCreatedUnique =
      err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
    if (!isRaceOnAutoCreatedUnique) throw err;
  }
}
