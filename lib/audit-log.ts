import "server-only";
import { Prisma, type AuditAction, type AuditEntityType, type UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// General write-path audit trail for the five core modules — Athlete,
// Recruiter, Prospect, NilDeal, Payment. Deliberately separate from
// AthleteSensitiveInfoAccessLog: that table exists specifically because
// government ID / date of birth / home address need stricter, dedicated
// handling than anything else in this schema. This function must never be
// called from the sensitive-info route, and never write anything that
// duplicates that table's own values — two independent logs, on purpose.

// Decimal/Date aren't JSON-safe as-is, and Decimal instances of the same
// value aren't reference- or structurally-equal, so a naive !== comparison
// would treat every Decimal field as "changed" on every write. Normalize
// before comparing and before storing.
function toJsonSafe(value: unknown): unknown {
  if (value === undefined) return null;
  if (value === null) return null;
  if (value instanceof Prisma.Decimal) return value.toString();
  if (value instanceof Date) return value.toISOString();
  return value;
}

function stableStringify(value: unknown): string {
  const safe = toJsonSafe(value);
  return typeof safe === "object" && safe !== null ? JSON.stringify(safe) : String(safe);
}

// CREATE: a flat snapshot of the initial values, not a before/after diff —
// there is no "before" to diff against.
// UPDATE/ARCHIVE/RESTORE: only the fields that actually changed, each as
// { before, after } — never the whole record, never just field names.
// Archive/restore fall out of this for free: comparing the full record
// before and after naturally reduces to just `{ archived: {before, after} }`
// since nothing else differs between those two snapshots.
function computeChanges(
  before: Record<string, unknown> | null,
  after: Record<string, unknown>,
): Record<string, unknown> {
  if (before === null) {
    const snapshot: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(after)) {
      if (value !== undefined) snapshot[key] = toJsonSafe(value);
    }
    return snapshot;
  }

  const changes: Record<string, { before: unknown; after: unknown }> = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    if (stableStringify(before[key]) !== stableStringify(after[key])) {
      changes[key] = { before: toJsonSafe(before[key]), after: toJsonSafe(after[key]) };
    }
  }
  return changes;
}

export interface LogAuditParams {
  actor: { id: string; role: UserRole };
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  // CREATE/UPDATE/ARCHIVE/RESTORE: pass before (null for CREATE) and after,
  // and the diff is computed here — this is what every ordinary write path
  // calls through.
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  // CONVERT (and any future action that doesn't fit the single-entity
  // before/after shape): pass the changes payload directly, skipping the
  // generic diff.
  changes?: Record<string, unknown>;
}

export async function logAudit(params: LogAuditParams): Promise<void> {
  const changes =
    params.changes ??
    computeChanges(
      params.action === "CREATE" ? null : (params.before ?? {}),
      params.after ?? {},
    );

  await prisma.auditLog.create({
    data: {
      actorUserId: params.actor.id,
      actorRole: params.actor.role,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      changes: changes as Prisma.InputJsonValue,
    },
  });
}
