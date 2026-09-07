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

  // Intersection, not union, of before/after keys — this is the structural
  // guarantee against the asymmetric-shape bug class that once let a
  // caller's mismatched select/include leak an athlete's actual
  // AthleteSensitiveInfo snapshot into this general log (a key present via
  // `include`/`select` on only one side read as "changed to/from null").
  // A key can only ever be reported as changed — and only ever have its
  // real value written here — when both snapshots actually carried it.
  // Fetching before/after with matching shapes is still the caller's job
  // (it's the only way to get a complete diff), but a future call site
  // that gets that wrong now degrades to "some fields silently missing
  // from this entry," never a leak.
  const beforeKeys = Object.keys(before);
  const afterKeys = new Set(Object.keys(after));
  const comparableKeys = beforeKeys.filter((key) => afterKeys.has(key));

  // Checked in both directions — comparableKeys can fall short of
  // beforeKeys (before had a key after lacks) or of afterKeys.size (after
  // had a key before lacks, the actual shape of the sensitive-info leak
  // this replaces: ADMIN_ATHLETE_INCLUDE's extra `sensitiveInfo` key only
  // ever showed up on the "after" side). Checking only the first direction
  // would have missed exactly the case this exists to catch.
  if (
    process.env.NODE_ENV !== "production" &&
    (comparableKeys.length !== beforeKeys.length || comparableKeys.length !== afterKeys.size)
  ) {
    const onlyBefore = beforeKeys.filter((key) => !afterKeys.has(key));
    const onlyAfter = [...afterKeys].filter((key) => !beforeKeys.includes(key));
    console.warn(
      "[audit-log] before/after shape mismatch — these fields exist on only one " +
        "side and were excluded from the diff, not compared: " +
        JSON.stringify({ onlyBefore, onlyAfter }) +
        ". This usually means the before and after queries used different " +
        "select/include shapes — fetch both the same way.",
    );
  }

  const changes: Record<string, { before: unknown; after: unknown }> = {};
  for (const key of comparableKeys) {
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
