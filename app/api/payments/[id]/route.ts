import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonValidationError } from "@/lib/api/http";
import { paymentUpdateSchema } from "@/lib/validation/payment";
import { applyInvoiceSentAutoStamp } from "@/lib/payment-data";
import { withComputedPaymentFields } from "@/lib/payment-computed";
import { logAudit } from "@/lib/audit-log";

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
    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return jsonError("Not found", 404);
    return NextResponse.json({ payment: withComputedPaymentFields(payment) });
  }

  if (user.role === "RECRUITER") {
    // nilDeal (and its athlete) fetched only to check scope — stripped
    // before the response, same pattern as NilDeal's own athlete-scope
    // check. nilDealId (a plain scalar) remains the one way this response
    // points at the deal.
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { nilDeal: { include: { athlete: { select: { recruiterId: true } } } } },
    });
    if (!payment || payment.nilDeal.athlete.recruiterId !== user.recruiterId) {
      return jsonError("Not found", 404);
    }
    const { nilDeal: _nilDeal, ...rest } = payment;
    return NextResponse.json({ payment: withComputedPaymentFields(rest) });
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

  const result = paymentUpdateSchema.safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  const existing = await prisma.payment.findUnique({ where: { id } });
  if (!existing) return jsonError("Not found", 404);

  const data = applyInvoiceSentAutoStamp(result.data, existing.invoiceSent);

  const payment = await prisma.payment.update({ where: { id }, data });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "UPDATE",
    entityType: "PAYMENT",
    entityId: id,
    before: existing,
    after: payment,
  });

  return NextResponse.json({ payment: withComputedPaymentFields(payment) });
}
