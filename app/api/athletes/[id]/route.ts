import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonValidationError } from "@/lib/api/http";
import { athleteUpdateSchema } from "@/lib/validation/athlete";
import {
  ADMIN_ATHLETE_INCLUDE,
  NON_ADMIN_ATHLETE_SELECT,
  toAthletePrismaData,
} from "@/lib/athlete-select";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await params;

  if (user.role === "ADMIN") {
    const athlete = await prisma.athlete.findUnique({
      where: { id },
      include: ADMIN_ATHLETE_INCLUDE,
    });
    if (!athlete) return jsonError("Not found", 404);
    return NextResponse.json({ athlete });
  }

  if (user.role === "RECRUITER") {
    // select (not include) — sensitiveInfo is never named here, so it
    // cannot come back regardless of what this athlete's data contains.
    const athlete = await prisma.athlete.findUnique({
      where: { id },
      select: NON_ADMIN_ATHLETE_SELECT,
    });
    // Not found OR not this recruiter's athlete — both 404, so a
    // recruiter can't distinguish "doesn't exist" from "not yours".
    if (!athlete || athlete.recruiterId !== user.recruiterId) {
      return jsonError("Not found", 404);
    }
    return NextResponse.json({ athlete });
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

  const result = athleteUpdateSchema.safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  const existing = await prisma.athlete.findUnique({ where: { id } });
  if (!existing) return jsonError("Not found", 404);

  const athlete = await prisma.athlete.update({
    where: { id },
    data: toAthletePrismaData(result.data),
    include: ADMIN_ATHLETE_INCLUDE,
  });
  return NextResponse.json({ athlete });
}
