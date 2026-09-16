import { NextResponse, type NextRequest } from "next/server";
import { ContractStatus, DealType, type Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import {
  jsonError,
  jsonValidationError,
  parseListParams,
  withAthleteName,
} from "@/lib/api/http";
import { nilDealCreateSchema } from "@/lib/validation/nil-deal";
import { logAudit } from "@/lib/audit-log";
import { assertSignedDealHasPriceable, ensureSignedDealHasPayment } from "@/lib/nil-deal-payment-sync";

// List view intentionally excludes the `payments` relation — keeps the
// list lightweight, and the detail route is the one place this API
// exposes a deal's payments. Athlete name is resolved here (a real name,
// not a raw athleteId) for the same reason it now is on Recruiter and
// Prospect's list routes.
const LIST_INCLUDE = { athlete: { select: { athleteName: true } } } satisfies Prisma.NilDealInclude;

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { skip, take, includeArchived } = parseListParams(request.nextUrl);
  const archivedFilter = includeArchived ? {} : { archived: false };

  const contractStatusParam = request.nextUrl.searchParams.get("contractStatus");
  const isValidContractStatus =
    contractStatusParam !== null && contractStatusParam in ContractStatus;
  const dealTypeParam = request.nextUrl.searchParams.get("dealType");
  const isValidDealType = dealTypeParam !== null && dealTypeParam in DealType;

  const filters: Prisma.NilDealWhereInput = {
    ...(isValidContractStatus ? { contractStatus: contractStatusParam as ContractStatus } : {}),
    ...(isValidDealType ? { dealType: dealTypeParam as DealType } : {}),
  };

  if (user.role === "ADMIN") {
    const where = { ...archivedFilter, ...filters };
    const [nilDeals, total] = await Promise.all([
      prisma.nilDeal.findMany({
        where,
        include: LIST_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.nilDeal.count({ where }),
    ]);
    return NextResponse.json({
      nilDeals: nilDeals.map(withAthleteName),
      total,
      skip,
      take,
    });
  }

  if (user.role === "RECRUITER") {
    // No recruiterId column on NilDeal itself — scope is determined by
    // joining through the deal's athlete to that athlete's recruiterId.
    const where = {
      ...archivedFilter,
      ...filters,
      athlete: { recruiterId: user.recruiterId },
    };
    const [nilDeals, total] = await Promise.all([
      prisma.nilDeal.findMany({
        where,
        include: LIST_INCLUDE,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.nilDeal.count({ where }),
    ]);
    return NextResponse.json({
      nilDeals: nilDeals.map(withAthleteName),
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

  const result = nilDealCreateSchema.safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  // A deal can be entered directly as Signed (e.g. logging one that was
  // already agreed before being entered into the system), not just
  // transitioned into it later via PATCH — same auto-payment guarantee
  // applies either way, so the same pre-check applies before creating.
  const resultingStatus = result.data.contractStatus ?? "DRAFTING";
  const priceableRejection = assertSignedDealHasPriceable(
    resultingStatus,
    result.data.dealValue ?? null,
    false,
  );
  if (priceableRejection) return jsonError(priceableRejection, 422);

  const nilDeal = await prisma.nilDeal.create({
    data: result.data,
  });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "CREATE",
    entityType: "NIL_DEAL",
    entityId: nilDeal.id,
    after: nilDeal,
  });

  await ensureSignedDealHasPayment(nilDeal, { id: user.id, role: user.role });

  const nilDealWithPayments = await prisma.nilDeal.findUnique({
    where: { id: nilDeal.id },
    include: { payments: true },
  });

  return NextResponse.json({ nilDeal: nilDealWithPayments }, { status: 201 });
}
