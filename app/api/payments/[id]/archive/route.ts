import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api/http";
import { withComputedPaymentFields } from "@/lib/payment-computed";

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

  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) return jsonError("Not found", 404);

  const payment = await prisma.payment.update({
    where: { id },
    data: { archived: true },
  });
  return NextResponse.json({ payment: withComputedPaymentFields(payment) });
}
