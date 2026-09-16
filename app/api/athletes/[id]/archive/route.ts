import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, withRecruiterName } from "@/lib/api/http";
import { ADMIN_ATHLETE_INCLUDE, WITH_RECRUITER } from "@/lib/athlete-select";
import { logAudit } from "@/lib/audit-log";

// Archive is its own action, not a generic PATCH field — this always sets
// the archived flag, never performs a real delete.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden", 403);

  const { id } = await params;

  // include, matching the update result below — keeps this call site
  // producing a complete diff. lib/audit-log.ts's computeChanges() is now
  // hardened to never leak sensitiveInfo even if this shape is wrong (see
  // its intersection-only key comparison), but fetching a matching shape
  // here is still what makes ARCHIVE's audit entry show every field that
  // actually changed, not just the ones both shapes happen to share.
  const existing = await prisma.athlete.findUnique({
    where: { id },
    include: { ...ADMIN_ATHLETE_INCLUDE, ...WITH_RECRUITER },
  });
  if (!existing) return jsonError("Not found", 404);

  const athlete = await prisma.athlete.update({
    where: { id },
    data: { archived: true },
    include: { ...ADMIN_ATHLETE_INCLUDE, ...WITH_RECRUITER },
  });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "ARCHIVE",
    entityType: "ATHLETE",
    entityId: id,
    before: existing,
    after: athlete,
  });

  return NextResponse.json({ athlete: withRecruiterName(athlete) });
}
