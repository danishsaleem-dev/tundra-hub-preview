import { NextResponse, type NextRequest } from "next/server";
import { RecruiterStatus, type Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonValidationError, parseListParams } from "@/lib/api/http";
import { recruiterCreateSchema } from "@/lib/validation/recruiter";
import { logAudit } from "@/lib/audit-log";

// Only ADMIN can list recruiters. A RECRUITER can see their own record
// (via GET /api/recruiters/[id]) but not browse the full roster — no
// route here grants that.
export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden", 403);

  const { skip, take, includeArchived } = parseListParams(request.nextUrl);

  const statusParam = request.nextUrl.searchParams.get("status");
  const isValidStatus = statusParam !== null && statusParam in RecruiterStatus;
  const stateFocusParam = request.nextUrl.searchParams.get("stateFocus");

  const where: Prisma.RecruiterWhereInput = {
    ...(includeArchived ? {} : { archived: false }),
    ...(isValidStatus ? { status: statusParam as RecruiterStatus } : {}),
    ...(stateFocusParam
      ? { stateFocus: { contains: stateFocusParam, mode: "insensitive" } }
      : {}),
  };

  const [recruiters, total] = await Promise.all([
    prisma.recruiter.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take,
    }),
    prisma.recruiter.count({ where }),
  ]);

  return NextResponse.json({ recruiters, total, skip, take });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden", 403);

  const raw = await request.json().catch(() => null);
  if (raw === null) return jsonError("Body must be valid JSON", 400);

  const result = recruiterCreateSchema.safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  const recruiter = await prisma.recruiter.create({ data: result.data });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "CREATE",
    entityType: "RECRUITER",
    entityId: recruiter.id,
    after: recruiter,
  });

  return NextResponse.json({ recruiter }, { status: 201 });
}
