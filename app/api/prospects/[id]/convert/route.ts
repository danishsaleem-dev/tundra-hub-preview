import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api/http";
import { ADMIN_ATHLETE_INCLUDE } from "@/lib/athlete-select";
import { logAudit } from "@/lib/audit-log";

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

  const { newAthlete, recruiterAudit } = await prisma.$transaction(async (tx) => {
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

    let recruiterAudit: { recruiterId: string; before: number; after: number } | null = null;
    if (prospect.recruiterId) {
      const recruiterBefore = await tx.recruiter.findUnique({
        where: { id: prospect.recruiterId },
        select: { athletesSigned: true },
      });
      const recruiterAfter = await tx.recruiter.update({
        where: { id: prospect.recruiterId },
        data: { athletesSigned: { increment: 1 } },
        select: { athletesSigned: true },
      });
      recruiterAudit = {
        recruiterId: prospect.recruiterId,
        before: recruiterBefore?.athletesSigned ?? 0,
        after: recruiterAfter.athletesSigned,
      };
    }

    return { newAthlete, recruiterAudit };
  });

  // Doesn't fit the single-entity before/after shape the other four
  // actions use (CREATE/UPDATE/ARCHIVE/RESTORE) — this is one business
  // event spanning three writes, so the changes payload is built by hand
  // rather than diffed, describing all three: the Prospect's
  // convertedToAthleteId flip, the new Athlete's copied fields, and the
  // Recruiter counter's before/after (when there was a recruiter to
  // credit). Never touches AthleteSensitiveInfo — the snapshot below only
  // lists the fields the conversion actually copies.
  await logAudit({
    actor: { id: admin.id, role: admin.role },
    action: "CONVERT",
    entityType: "PROSPECT",
    entityId: prospect.id,
    changes: {
      convertedToAthleteId: { before: null, after: newAthlete.id },
      createdAthlete: {
        id: newAthlete.id,
        athleteName: newAthlete.athleteName,
        email: newAthlete.email,
        phone: newAthlete.phone,
        position: newAthlete.position,
        school: newAthlete.school,
        parentGuardianName: newAthlete.parentGuardianName,
        parentPhone: newAthlete.parentPhone,
        socialProfiles: newAthlete.socialProfiles,
        recruitingProfile: newAthlete.recruitingProfile,
        recruiterId: newAthlete.recruiterId,
      },
      ...(recruiterAudit
        ? {
            recruiterAthletesSigned: {
              recruiterId: recruiterAudit.recruiterId,
              before: recruiterAudit.before,
              after: recruiterAudit.after,
            },
          }
        : {}),
    },
  });

  return NextResponse.json({ athlete: newAthlete });
}
