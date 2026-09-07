import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api/http";
import { logAudit } from "@/lib/audit-log";

// Admin-only — a Recruiter has read-only access to NIL Deals for their
// assigned athletes, no write access at all (not even update), so archive
// is exclusively an admin action here.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden", 403);

  const { id } = await params;

  // include, matching the update result below — a plain findUnique here
  // would make `payments` appear only on the "after" side of the audit
  // diff and log the deal's full payment history as a false "change".
  const existing = await prisma.nilDeal.findUnique({
    where: { id },
    include: { payments: true },
  });
  if (!existing) return jsonError("Not found", 404);

  const nilDeal = await prisma.nilDeal.update({
    where: { id },
    data: { archived: true },
    include: { payments: true },
  });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "ARCHIVE",
    entityType: "NIL_DEAL",
    entityId: id,
    before: existing,
    after: nilDeal,
  });

  return NextResponse.json({ nilDeal });
}
