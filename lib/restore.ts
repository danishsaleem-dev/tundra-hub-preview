import "server-only";
import { NextResponse } from "next/server";
import type { AuditEntityType } from "@prisma/client";
import { requireAdmin } from "@/lib/auth/current-user";
import { jsonError } from "@/lib/api/http";
import { logAudit } from "@/lib/audit-log";

// Every module's un-archive action is identical except for which model it
// operates on and how the response is shaped — same admin-only gate, same
// find-or-404, same single-field update, same graceful success when the
// record is already active (unconditionally setting archived: false is
// itself the "no-op on an already-active record" behavior — there's no
// separate case to special-case). Factored into one implementation, same
// as getActivityFeed(), so a bug fix or RBAC change only has to happen
// once, not five times — including the audit logging added here, which
// now covers all five RESTORE paths from this one place.
export function createRestoreHandler<TRecord>(config: {
  entityType: AuditEntityType;
  findById: (id: string) => Promise<(Record<string, unknown> & { id: string }) | null>;
  restore: (id: string) => Promise<TRecord>;
  responseKey: string;
}) {
  return async function POST(
    _request: Request,
    { params }: { params: Promise<{ id: string }> },
  ) {
    const admin = await requireAdmin();
    if (!admin) return jsonError("Forbidden", 403);

    const { id } = await params;

    const existing = await config.findById(id);
    if (!existing) return jsonError("Not found", 404);

    const record = await config.restore(id);

    await logAudit({
      actor: { id: admin.id, role: admin.role },
      action: "RESTORE",
      entityType: config.entityType,
      entityId: id,
      before: existing,
      after: record as unknown as Record<string, unknown>,
    });

    return NextResponse.json({ [config.responseKey]: record });
  };
}
