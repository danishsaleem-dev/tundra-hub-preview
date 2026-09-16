import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, withRecruiterName } from "@/lib/api/http";
import { logAudit } from "@/lib/audit-log";

const WITH_RECRUITER = { recruiter: { select: { name: true } } };

// Admin-only, same as Recruiter/Athlete archive — a Recruiter can update
// their own Prospects but not archive them.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden", 403);

  const { id } = await params;

  const existing = await prisma.prospect.findUnique({ where: { id }, include: WITH_RECRUITER });
  if (!existing) return jsonError("Not found", 404);

  const prospect = await prisma.prospect.update({
    where: { id },
    data: { archived: true },
    include: WITH_RECRUITER,
  });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "ARCHIVE",
    entityType: "PROSPECT",
    entityId: id,
    before: existing,
    after: prospect,
  });

  return NextResponse.json({ prospect: withRecruiterName(prospect) });
}
