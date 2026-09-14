import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonValidationError } from "@/lib/api/http";
import { nilDealUpdateSchema } from "@/lib/validation/nil-deal";
import { logAudit } from "@/lib/audit-log";
import { withComputedPaymentFieldsList } from "@/lib/payment-computed";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await params;

  // Deliberately no `archived: false` filter here, unlike the list route —
  // archiving a record must not cut off direct access to it by id, per
  // M5's retrievability requirement. The list route is the only place
  // that hides archived records by default.
  if (user.role === "ADMIN") {
    const nilDeal = await prisma.nilDeal.findUnique({
      where: { id },
      include: { payments: true, athlete: { select: { athleteName: true } } },
    });
    if (!nilDeal) return jsonError("Not found", 404);
    const { athlete, payments, ...rest } = nilDeal;
    return NextResponse.json({
      nilDeal: {
        ...rest,
        athleteName: athlete.athleteName,
        payments: withComputedPaymentFieldsList(payments),
      },
    });
  }

  if (user.role === "RECRUITER") {
    // athlete is fetched for two reasons now: recruiterId to check scope
    // (stripped before the response goes out, same as before) and
    // athleteName to resolve a real name instead of a raw athleteId
    // (kept). payments remains the one way this response points at
    // payments, now run through the same computed-fields function every
    // other Payment-returning route already uses.
    const nilDeal = await prisma.nilDeal.findUnique({
      where: { id },
      include: {
        payments: true,
        athlete: { select: { recruiterId: true, athleteName: true } },
      },
    });
    if (!nilDeal || nilDeal.athlete.recruiterId !== user.recruiterId) {
      return jsonError("Not found", 404);
    }
    const { athlete, payments, ...rest } = nilDeal;
    return NextResponse.json({
      nilDeal: {
        ...rest,
        athleteName: athlete.athleteName,
        payments: withComputedPaymentFieldsList(payments),
      },
    });
  }

  return jsonError("Forbidden", 403);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden", 403);

  const { id } = await params;

  const raw = await request.json().catch(() => null);
  if (raw === null) return jsonError("Body must be valid JSON", 400);

  const result = nilDealUpdateSchema.safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  const existing = await prisma.nilDeal.findUnique({ where: { id } });
  if (!existing) return jsonError("Not found", 404);

  // Resolve what this update actually leaves the deal in, merging the
  // partial request onto the current row — needed below to decide
  // up front whether the automatic Payment creation this triggers is
  // even possible, before writing anything.
  const resultingStatus = result.data.contractStatus ?? existing.contractStatus;
  const resultingDealValue =
    "dealValue" in result.data ? result.data.dealValue : existing.dealValue;

  if (resultingStatus === "SIGNED") {
    const linkedPayment = await prisma.payment.findFirst({ where: { nilDealId: id } });
    // Payment.paymentAmount is NOT NULL at the schema level, so a missing
    // dealValue makes the auto-created payment this transition requires
    // literally unrepresentable — not a case for a $0 placeholder, which
    // would just be a fabricated number on a real financial record.
    // Rejected outright, before the update is applied, rather than
    // letting the deal go SIGNED with no payment or a fake one.
    if (!linkedPayment && resultingDealValue === null) {
      return jsonError(
        "Cannot mark this deal SIGNED without a dealValue — a Payment record would be created automatically for it, and paymentAmount can't be null. Set dealValue first, then retry.",
        422,
      );
    }
  }

  const updated = await prisma.nilDeal.update({
    where: { id },
    data: result.data,
  });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "UPDATE",
    entityType: "NIL_DEAL",
    entityId: id,
    before: existing,
    after: updated,
  });

  // Replicates the original Airtable automation: when a deal's status is
  // (or becomes) Signed, ensure exactly one Payment exists for it. Keyed
  // on existence, not on whether this specific request changed the
  // status — so re-saving an already-Signed deal never creates a second
  // one, matching the original automation's own idempotency, not just a
  // single-request in-memory guard.
  if (updated.contractStatus === "SIGNED") {
    const linkedPayment = await prisma.payment.findFirst({ where: { nilDealId: id } });
    if (!linkedPayment) {
      try {
        // dealValue is guaranteed non-null here — the pre-check above
        // already rejected the only case where it wouldn't be.
        // isAutoCreated: true is what the partial unique index enforces
        // on — this is the one and only Payment allowed to carry it for
        // this deal, at the database level, not just via the findFirst
        // check above.
        const autoPayment = await prisma.payment.create({
          data: {
            paymentName: `${updated.dealName} Payment`,
            nilDealId: updated.id,
            paymentAmount: updated.dealValue!,
            status: "PENDING",
            isAutoCreated: true,
          },
        });

        await logAudit({
          actor: { id: user.id, role: user.role },
          action: "CREATE",
          entityType: "PAYMENT",
          entityId: autoPayment.id,
          after: autoPayment,
        });
      } catch (err) {
        // P2002 (unique constraint violation) here means two requests
        // raced past the findFirst check above and both tried to create
        // the auto-payment — the database's partial unique index is the
        // real guarantee, this in-app check is just the common case's
        // fast path. Whichever request loses the race has nothing to do:
        // a payment already exists, which was the whole goal.
        const isRaceOnAutoCreatedUnique =
          err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
        if (!isRaceOnAutoCreatedUnique) throw err;
      }
    }
  }

  // Refetch rather than reuse `updated` — payments may have just changed
  // as a side effect above, and the response should reflect that. Also
  // resolves athleteName so it doesn't vanish from the client after a
  // save, and runs payments through the same computed-fields function
  // GET already uses.
  const nilDeal = await prisma.nilDeal.findUnique({
    where: { id },
    include: { payments: true, athlete: { select: { athleteName: true } } },
  });
  const { athlete, payments, ...rest } = nilDeal!;
  return NextResponse.json({
    nilDeal: {
      ...rest,
      athleteName: athlete.athleteName,
      payments: withComputedPaymentFieldsList(payments),
    },
  });
}
