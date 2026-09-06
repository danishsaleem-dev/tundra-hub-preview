import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonValidationError, parseListParams } from "@/lib/api/http";
import { prospectCreateSchema } from "@/lib/validation/prospect";
import { toProspectPrismaData } from "@/lib/prospect-data";
import { logAudit } from "@/lib/audit-log";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { skip, take, includeArchived } = parseListParams(request.nextUrl);
  const archivedFilter = includeArchived ? {} : { archived: false };

  if (user.role === "ADMIN") {
    const [prospects, total] = await Promise.all([
      prisma.prospect.findMany({
        where: archivedFilter,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.prospect.count({ where: archivedFilter }),
    ]);
    return NextResponse.json({ prospects, total, skip, take });
  }

  if (user.role === "RECRUITER") {
    const where = { ...archivedFilter, recruiterId: user.recruiterId };
    const [prospects, total] = await Promise.all([
      prisma.prospect.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      prisma.prospect.count({ where }),
    ]);
    return NextResponse.json({ prospects, total, skip, take });
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

  const prospect = await prisma.prospect.create({ data: toProspectPrismaData(result.data) });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "CREATE",
    entityType: "PROSPECT",
    entityId: prospect.id,
    after: prospect,
  });

  return NextResponse.json({ prospect }, { status: 201 });
}
