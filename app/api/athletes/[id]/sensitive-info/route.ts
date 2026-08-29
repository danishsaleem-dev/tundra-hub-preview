import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonValidationError } from "@/lib/api/http";
import { athleteSensitiveInfoWritableSchema } from "@/lib/validation/athlete-sensitive-info";

// Admin-only, and deliberately its own route rather than folded into the
// general Athlete PATCH — this is the one and only path that ever writes
// Government ID, DOB, or home address. Create-or-update (upsert): a
// freshly created Athlete has no AthleteSensitiveInfo row at all until an
// admin sets one here.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden", 403);

  const { id } = await params;

  const athlete = await prisma.athlete.findUnique({ where: { id } });
  if (!athlete) return jsonError("Not found", 404);

  const raw = await request.json().catch(() => null);
  if (raw === null) return jsonError("Body must be valid JSON", 400);

  const result = athleteSensitiveInfoWritableSchema.safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  const sensitiveInfo = await prisma.athleteSensitiveInfo.upsert({
    where: { athleteId: id },
    create: { athleteId: id, ...result.data },
    update: result.data,
  });

  return NextResponse.json({ sensitiveInfo });
}
