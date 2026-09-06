import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonValidationError, parseListParams } from "@/lib/api/http";
import { nilDealCreateSchema } from "@/lib/validation/nil-deal";
import { logAudit } from "@/lib/audit-log";

// List view intentionally excludes the `payments` relation — keeps the
// list lightweight, and the detail route (below) is the one place this
// API exposes a deal's payments, so there's no second/ambiguous path to
// the same data.
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { skip, take, includeArchived } = parseListParams(request.nextUrl);
  const archivedFilter = includeArchived ? {} : { archived: false };

  if (user.role === "ADMIN") {
    const [nilDeals, total] = await Promise.all([
      prisma.nilDeal.findMany({
        where: archivedFilter,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.nilDeal.count({ where: archivedFilter }),
    ]);
    return NextResponse.json({ nilDeals, total, skip, take });
  }

  if (user.role === "RECRUITER") {
    // No recruiterId column on NilDeal itself — scope is determined by
    // joining through the deal's athlete to that athlete's recruiterId.
    const where = { ...archivedFilter, athlete: { recruiterId: user.recruiterId } };
    const [nilDeals, total] = await Promise.all([
      prisma.nilDeal.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.nilDeal.count({ where }),
    ]);
    return NextResponse.json({ nilDeals, total, skip, take });
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

  const nilDeal = await prisma.nilDeal.create({
    data: result.data,
    include: { payments: true },
  });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "CREATE",
    entityType: "NIL_DEAL",
    entityId: nilDeal.id,
    after: nilDeal,
  });

  return NextResponse.json({ nilDeal }, { status: 201 });
}
