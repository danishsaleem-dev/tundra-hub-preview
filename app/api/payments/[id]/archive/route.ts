import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, withDealName } from "@/lib/api/http";
import { withComputedPaymentFields } from "@/lib/payment-computed";
import { logAudit } from "@/lib/audit-log";

const WITH_DEAL = { nilDeal: { select: { dealName: true } } };

// Admin-only — a Recruiter has read-only access to Payments scoped through
// their assigned athletes' NIL Deals, no write access at all.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden", 403);

  const { id } = await params;

  const existing = await prisma.payment.findUnique({ where: { id }, include: WITH_DEAL });
  if (!existing) return jsonError("Not found", 404);

  const payment = await prisma.payment.update({
    where: { id },
    data: { archived: true },
    include: WITH_DEAL,
  });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "ARCHIVE",
    entityType: "PAYMENT",
    entityId: id,
    before: existing,
    after: payment,
  });

  return NextResponse.json({ payment: withDealName(withComputedPaymentFields(payment)) });
}
