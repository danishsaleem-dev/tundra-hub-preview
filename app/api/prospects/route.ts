import { NextResponse, type NextRequest } from "next/server";
import { ProspectStatus, Tier, type Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonValidationError, parseListParams } from "@/lib/api/http";
import { prospectCreateSchema } from "@/lib/validation/prospect";
import { toProspectPrismaData } from "@/lib/prospect-data";
import { logAudit } from "@/lib/audit-log";

// Flattens the recruiter relation to a display name — the list/detail UI
// needs a human name, not a raw recruiterId, and this is the one place
// that resolves it so both the list and single-record routes shape their
// response the same way.
function withRecruiterName<T extends { recruiter: { name: string } | null }>(
  record: T,
): Omit<T, "recruiter"> & { recruiterName: string | null } {
  const { recruiter, ...rest } = record;
  return { ...rest, recruiterName: recruiter?.name ?? null };
}

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { skip, take, includeArchived } = parseListParams(request.nextUrl);
  const archivedFilter = includeArchived ? {} : { archived: false };

  const statusParam = request.nextUrl.searchParams.get("status");
  const isValidStatus = statusParam !== null && statusParam in ProspectStatus;
  const priorityTierParam = request.nextUrl.searchParams.get("priorityTier");
  const isValidTier = priorityTierParam !== null && priorityTierParam in Tier;

  const filters: Prisma.ProspectWhereInput = {
    ...(isValidStatus ? { status: statusParam as ProspectStatus } : {}),
    ...(isValidTier ? { priorityTier: priorityTierParam as Tier } : {}),
  };

  if (user.role === "ADMIN") {
    const where = { ...archivedFilter, ...filters };
    const [prospects, total] = await Promise.all([
      prisma.prospect.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: { recruiter: { select: { name: true } } },
      }),
      prisma.prospect.count({ where }),
    ]);
    return NextResponse.json({
      prospects: prospects.map(withRecruiterName),
      total,
      skip,
      take,
    });
  }

  if (user.role === "RECRUITER") {
    const where = { ...archivedFilter, ...filters, recruiterId: user.recruiterId };
    const [prospects, total] = await Promise.all([
      prisma.prospect.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
        include: { recruiter: { select: { name: true } } },
      }),
      prisma.prospect.count({ where }),
    ]);
    return NextResponse.json({
      prospects: prospects.map(withRecruiterName),
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

  const result = prospectCreateSchema.safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  const prospect = await prisma.prospect.create({
    data: toProspectPrismaData(result.data),
    include: { recruiter: { select: { name: true } } },
  });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "CREATE",
    entityType: "PROSPECT",
    entityId: prospect.id,
    after: prospect,
  });

  return NextResponse.json({ prospect: withRecruiterName(prospect) }, { status: 201 });
}
