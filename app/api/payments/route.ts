import { NextResponse, type NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonValidationError, parseListParams } from "@/lib/api/http";
import { paymentCreateSchema } from "@/lib/validation/payment";
import { applyInvoiceSentAutoStamp } from "@/lib/payment-data";
import { withComputedPaymentFieldsList, withComputedPaymentFields } from "@/lib/payment-computed";
import { logAudit } from "@/lib/audit-log";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { skip, take, includeArchived } = parseListParams(request.nextUrl);
  const archivedFilter = includeArchived ? {} : { archived: false };

  if (user.role === "ADMIN") {
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where: archivedFilter,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.payment.count({ where: archivedFilter }),
    ]);
    return NextResponse.json({
      payments: withComputedPaymentFieldsList(payments),
      total,
      skip,
      take,
    });
  }

  if (user.role === "RECRUITER") {
    // Two-level join: Payment -> NilDeal -> Athlete -> recruiterId. No
    // direct field on Payment itself carries this.
    const where = {
      ...archivedFilter,
      nilDeal: { athlete: { recruiterId: user.recruiterId } },
    };
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.payment.count({ where }),
    ]);
    return NextResponse.json({
      payments: withComputedPaymentFieldsList(payments),
      total,
      skip,
      take,
    });
  }

  return jsonError("Forbidden", 403);
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden", 403);

  const raw = await request.json().catch(() => null);
  if (raw === null) return jsonError("Body must be valid JSON", 400);

  const result = paymentCreateSchema.safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  const data = applyInvoiceSentAutoStamp(result.data, false) as Prisma.PaymentUncheckedCreateInput;

  const payment = await prisma.payment.create({ data });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "CREATE",
    entityType: "PAYMENT",
    entityId: payment.id,
    after: payment,
  });

  return NextResponse.json({ payment: withComputedPaymentFields(payment) }, { status: 201 });
}
