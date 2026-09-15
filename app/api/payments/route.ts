import { NextResponse, type NextRequest } from "next/server";
import { PaymentStatus, type Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import {
  jsonError,
  jsonValidationError,
  parseListParams,
  withDealName,
} from "@/lib/api/http";
import { paymentCreateSchema } from "@/lib/validation/payment";
import { applyInvoiceSentAutoStamp } from "@/lib/payment-data";
import { withComputedPaymentFieldsList, withComputedPaymentFields } from "@/lib/payment-computed";
import { logAudit } from "@/lib/audit-log";

// Resolves the linked deal's name (dealName), not just the raw nilDealId
// — same gap already fixed on Recruiter, Prospect, and NIL Deal's list/
// detail routes.
const DEAL_INCLUDE = { nilDeal: { select: { dealName: true } } } satisfies Prisma.PaymentInclude;

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { skip, take, includeArchived } = parseListParams(request.nextUrl);
  const archivedFilter = includeArchived ? {} : { archived: false };

  const statusParam = request.nextUrl.searchParams.get("status");
  const isValidStatus = statusParam !== null && statusParam in PaymentStatus;
  const filters: Prisma.PaymentWhereInput = {
    ...(isValidStatus ? { status: statusParam as PaymentStatus } : {}),
  };

  if (user.role === "ADMIN") {
    const where = { ...archivedFilter, ...filters };
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: DEAL_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.payment.count({ where }),
    ]);
    return NextResponse.json({
      payments: withComputedPaymentFieldsList(payments).map(withDealName),
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
      ...filters,
      nilDeal: { athlete: { recruiterId: user.recruiterId } },
    };
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: DEAL_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.payment.count({ where }),
    ]);
    return NextResponse.json({
      payments: withComputedPaymentFieldsList(payments).map(withDealName),
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

  const payment = await prisma.payment.create({ data, include: DEAL_INCLUDE });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "CREATE",
    entityType: "PAYMENT",
    entityId: payment.id,
    after: payment,
  });

  return NextResponse.json(
    { payment: withDealName(withComputedPaymentFields(payment)) },
    { status: 201 },
  );
}
