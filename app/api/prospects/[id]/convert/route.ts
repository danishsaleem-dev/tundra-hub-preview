import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api/http";
import { ADMIN_ATHLETE_INCLUDE } from "@/lib/athlete-select";

// Admin-only, one-way pipeline terminal action: a SIGNED Prospect becomes a
// real Athlete record. All three writes (create the Athlete, stamp the
// Prospect's convertedToAthleteId, bump the Recruiter's athletesSigned)
// happen in one transaction — either the whole conversion happens or none
// of it does, never a half-converted Prospect with no matching Athlete.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin) return jsonError("Forbidden", 403);

  const { id } = await params;

  const prospect = await prisma.prospect.findUnique({ where: { id } });
  if (!prospect) return jsonError("Not found", 404);

  if (prospect.status !== "SIGNED") {
    return jsonError(
      `Cannot convert — Prospect status is ${prospect.status}, must be SIGNED.`,
      422,
    );
  }
  if (prospect.convertedToAthleteId) {
    return jsonError("This Prospect has already been converted to an Athlete.", 409);
  }

  const athlete = await prisma.$transaction(async (tx) => {
    const newAthlete = await tx.athlete.create({
      data: {
        athleteName: prospect.fullName,
        email: prospect.email,
        phone: prospect.phone,
        position: prospect.position,
        school: prospect.school,
        parentGuardianName: prospect.parentGuardianName,
        parentPhone: prospect.parentPhone,
        socialProfiles:
          prospect.socialLinks === null ? Prisma.JsonNull : prospect.socialLinks,
        recruitingProfile: prospect.filmLink
          ? { filmLink: prospect.filmLink }
          : Prisma.JsonNull,
        recruiterId: prospect.recruiterId,
      },
      include: ADMIN_ATHLETE_INCLUDE,
    });

    await tx.prospect.update({
      where: { id: prospect.id },
      data: { convertedToAthleteId: newAthlete.id },
    });

    if (prospect.recruiterId) {
      await tx.recruiter.update({
        where: { id: prospect.recruiterId },
        data: { athletesSigned: { increment: 1 } },
      });
    }

    return newAthlete;
  });

  return NextResponse.json({ athlete });
}
