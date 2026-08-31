import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api/http";
import { ADMIN_ATHLETE_INCLUDE } from "@/lib/athlete-select";

// Admin-only, and deliberately its own action rather than a field on the
// general Athlete PATCH — editing eligibilityRemaining and verifying it
// are different actions and must not be conflated. This is the one and
// only place eligibilityVerified can ever become true.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden", 403);

  const { id } = await params;

  const existing = await prisma.athlete.findUnique({ where: { id } });
  if (!existing) return jsonError("Not found", 404);

  if (!existing.eligibilityRemaining) {
    return jsonError("Cannot verify eligibility — eligibilityRemaining is not set on this record.", 422);
  }

  const athlete = await prisma.athlete.update({
    where: { id },
    data: { eligibilityVerified: true },
    include: ADMIN_ATHLETE_INCLUDE,
  });
  return NextResponse.json({ athlete });
}
