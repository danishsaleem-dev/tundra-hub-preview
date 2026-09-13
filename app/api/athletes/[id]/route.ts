import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonValidationError, withRecruiterName } from "@/lib/api/http";
import { humanizeFieldName } from "@/lib/format";
import { logAudit } from "@/lib/audit-log";
import {
  athleteUpdateSchema,
  ATHLETE_SELF_EDITABLE_FIELDS,
} from "@/lib/validation/athlete";
import {
  ADMIN_ATHLETE_INCLUDE,
  NON_ADMIN_ATHLETE_SELECT,
  toAthletePrismaData,
} from "@/lib/athlete-select";

const SELF_EDITABLE_SHAPE = Object.fromEntries(
  ATHLETE_SELF_EDITABLE_FIELDS.map((field) => [field, true]),
) as Record<(typeof ATHLETE_SELF_EDITABLE_FIELDS)[number], true>;

// Adds the recruiter's name alongside whichever sensitive-info shaping
// (or lack of it) the caller's role already earned — a purely additive
// display convenience, not a second RBAC decision. Used for both the
// ADMIN_ATHLETE_INCLUDE and NON_ADMIN_ATHLETE_SELECT shapes below.
const WITH_RECRUITER = { recruiter: { select: { name: true } } } satisfies Prisma.AthleteInclude;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await params;

  // Deliberately no `archived: false` filter here, unlike the list route —
  // archiving a record must not cut off direct access to it by id, per
  // M5's retrievability requirement. The list route is the only place
  // that hides archived records by default.
  if (user.role === "ADMIN") {
    const athlete = await prisma.athlete.findUnique({
      where: { id },
      include: { ...ADMIN_ATHLETE_INCLUDE, ...WITH_RECRUITER },
    });
    if (!athlete) return jsonError("Not found", 404);
    return NextResponse.json({ athlete: withRecruiterName(athlete) });
  }

  if (user.role === "RECRUITER") {
    // select (not include) — sensitiveInfo is never named here, so it
    // cannot come back regardless of what this athlete's data contains.
    const athlete = await prisma.athlete.findUnique({
      where: { id },
      select: { ...NON_ADMIN_ATHLETE_SELECT, ...WITH_RECRUITER },
    });
    // Not found OR not this recruiter's athlete — both 404, so a
    // recruiter can't distinguish "doesn't exist" from "not yours".
    if (!athlete || athlete.recruiterId !== user.recruiterId) {
      return jsonError("Not found", 404);
    }
    return NextResponse.json({ athlete: withRecruiterName(athlete) });
  }

  if (user.role === "ATHLETE") {
    // Same select (not include) as RECRUITER — sensitiveInfo is never
    // named here, so it cannot come back for the athlete's own record
    // either, same structural exclusion, not a role-based filter on top
    // of a query that could return it.
    if (user.athleteId !== id) return jsonError("Not found", 404);
    const athlete = await prisma.athlete.findUnique({
      where: { id },
      select: { ...NON_ADMIN_ATHLETE_SELECT, ...WITH_RECRUITER },
    });
    if (!athlete) return jsonError("Not found", 404);
    return NextResponse.json({ athlete: withRecruiterName(athlete) });
  }

  return jsonError("Forbidden", 403);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN" && user.role !== "ATHLETE") {
    return jsonError("Forbidden", 403);
  }

  const { id } = await params;

  const raw = await request.json().catch(() => null);
  if (raw === null || typeof raw !== "object") {
    return jsonError("Body must be valid JSON", 400);
  }

  if (user.role === "ADMIN") {
    const result = athleteUpdateSchema.safeParse(raw);
    if (!result.success) return jsonValidationError(result.error);

    // include, not a plain findUnique — must match the update result's
    // shape below (also ADMIN_ATHLETE_INCLUDE) or the audit diff below
    // would see sensitiveInfo appear out of nowhere on the "after" side
    // and log the athlete's actual DOB/address/government-ID data as a
    // "change" into this general log, which must never happen.
    const existing = await prisma.athlete.findUnique({
      where: { id },
      include: { ...ADMIN_ATHLETE_INCLUDE, ...WITH_RECRUITER },
    });
    if (!existing) return jsonError("Not found", 404);

    const athlete = await prisma.athlete.update({
      where: { id },
      data: toAthletePrismaData(result.data),
      include: { ...ADMIN_ATHLETE_INCLUDE, ...WITH_RECRUITER },
    });

    await logAudit({
      actor: { id: user.id, role: user.role },
      action: "UPDATE",
      entityType: "ATHLETE",
      entityId: id,
      before: existing,
      after: athlete,
    });

    return NextResponse.json({ athlete: withRecruiterName(athlete) });
  }

  // ATHLETE: own record only, self-editable fields only.
  if (user.athleteId !== id) return jsonError("Not found", 404);

  const disallowedKeys = Object.keys(raw).filter(
    (key) => !ATHLETE_SELF_EDITABLE_FIELDS.includes(key as never),
  );
  if (disallowedKeys.length > 0) {
    return jsonError(
      `These fields are not self-editable: ${disallowedKeys.map(humanizeFieldName).join(", ")}`,
      403,
    );
  }

  const result = athleteUpdateSchema.pick(SELF_EDITABLE_SHAPE).safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  // select, matching the update result's shape below (also
  // NON_ADMIN_ATHLETE_SELECT) — a plain findUnique here would carry
  // fields like organizationId that the select result omits, and the
  // audit diff below would log those as false "changed to null" entries.
  const existing = await prisma.athlete.findUnique({
    where: { id },
    select: { ...NON_ADMIN_ATHLETE_SELECT, ...WITH_RECRUITER },
  });
  if (!existing) return jsonError("Not found", 404);

  const athlete = await prisma.athlete.update({
    where: { id },
    data: toAthletePrismaData(result.data),
    select: { ...NON_ADMIN_ATHLETE_SELECT, ...WITH_RECRUITER },
  });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "UPDATE",
    entityType: "ATHLETE",
    entityId: id,
    before: existing,
    after: athlete,
  });

  return NextResponse.json({ athlete: withRecruiterName(athlete) });
}
