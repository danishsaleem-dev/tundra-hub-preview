import { NextResponse, type NextRequest } from "next/server";
import { Position, RecruitingStatus, type Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import {
  jsonError,
  jsonValidationError,
  parseListParams,
  withRecruiterName,
} from "@/lib/api/http";
import { athleteCreateSchema } from "@/lib/validation/athlete";
import {
  ADMIN_ATHLETE_INCLUDE,
  NON_ADMIN_ATHLETE_SELECT,
  toAthletePrismaData,
} from "@/lib/athlete-select";
import { logAudit } from "@/lib/audit-log";

// A list view never needs the sensitiveInfo relation, regardless of role
// — showing a table of rows is exactly the "information density" risk
// that data must never be part of. Only the single-record route (where
// the detail page's dedicated sensitive-info section actually uses it)
// fetches that relation; the list route uses this same non-sensitive
// shape for ADMIN and RECRUITER alike, with the recruiter's name resolved
// for the "assigned recruiter" column.
const LIST_SELECT = {
  ...NON_ADMIN_ATHLETE_SELECT,
  recruiter: { select: { name: true } },
} satisfies Prisma.AthleteSelect;

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { skip, take, includeArchived } = parseListParams(request.nextUrl);
  const archivedFilter = includeArchived ? {} : { archived: false };

  const positionParam = request.nextUrl.searchParams.get("position");
  const isValidPosition = positionParam !== null && positionParam in Position;
  const statusParam = request.nextUrl.searchParams.get("currentRecruitingStatus");
  const isValidStatus = statusParam !== null && statusParam in RecruitingStatus;

  const filters: Prisma.AthleteWhereInput = {
    ...(isValidPosition ? { position: positionParam as Position } : {}),
    ...(isValidStatus ? { currentRecruitingStatus: statusParam as RecruitingStatus } : {}),
  };

  if (user.role === "ADMIN") {
    const where = { ...archivedFilter, ...filters };
    const [athletes, total] = await Promise.all([
      prisma.athlete.findMany({
        where,
        select: LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.athlete.count({ where }),
    ]);
    return NextResponse.json({
      athletes: athletes.map(withRecruiterName),
      total,
      skip,
      take,
    });
  }

  if (user.role === "RECRUITER") {
    // Scoped to athletes this recruiter is actually assigned to — never
    // the full roster, and never the sensitive-info relation.
    const where = { ...archivedFilter, ...filters, recruiterId: user.recruiterId };
    const [athletes, total] = await Promise.all([
      prisma.athlete.findMany({
        where,
        select: LIST_SELECT,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.athlete.count({ where }),
    ]);
    return NextResponse.json({
      athletes: athletes.map(withRecruiterName),
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

  const result = athleteCreateSchema.safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  const athlete = await prisma.athlete.create({
    data: toAthletePrismaData(result.data),
    include: ADMIN_ATHLETE_INCLUDE,
  });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "CREATE",
    entityType: "ATHLETE",
    entityId: athlete.id,
    after: athlete,
  });

  return NextResponse.json({ athlete }, { status: 201 });
}
