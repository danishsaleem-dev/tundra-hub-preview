import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonValidationError } from "@/lib/api/http";
import { prospectUpdateSchema } from "@/lib/validation/prospect";
import { toProspectPrismaData } from "@/lib/prospect-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await params;

  if (user.role === "ADMIN") {
    const prospect = await prisma.prospect.findUnique({ where: { id } });
    if (!prospect) return jsonError("Not found", 404);
    return NextResponse.json({ prospect });
  }

  if (user.role === "RECRUITER") {
    const prospect = await prisma.prospect.findUnique({ where: { id } });
    // Not found OR not this recruiter's prospect — both 404, same masking
    // pattern as the Athlete route.
    if (!prospect || prospect.recruiterId !== user.recruiterId) {
      return jsonError("Not found", 404);
    }
    return NextResponse.json({ prospect });
  }

  return jsonError("Forbidden", 403);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN" && user.role !== "RECRUITER") {
    return jsonError("Forbidden", 403);
  }

  const { id } = await params;

  const raw = await request.json().catch(() => null);
  if (raw === null) return jsonError("Body must be valid JSON", 400);

  const result = prospectUpdateSchema.safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  const existing = await prisma.prospect.findUnique({ where: { id } });
  if (!existing) return jsonError("Not found", 404);

  if (user.role === "RECRUITER" && existing.recruiterId !== user.recruiterId) {
    return jsonError("Not found", 404);
  }

  const prospect = await prisma.prospect.update({
    where: { id },
    data: toProspectPrismaData(result.data),
  });
  return NextResponse.json({ prospect });
}
