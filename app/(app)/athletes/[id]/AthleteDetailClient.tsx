"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { Button } from "@/components/Button";
import { ConfigurableDetail } from "@/components/ConfigurableDetail";
import { ConfigurableForm } from "@/components/ConfigurableForm";
import { Modal } from "@/components/Modal";
import { Panel } from "@/components/Panel";
import { useToast } from "@/components/ToastProvider";
import { zodIssuesToFieldErrors } from "@/lib/form-config";
import { ENTITY_LABELS } from "@/lib/labels";
import {
  ATHLETE_DETAIL_FIELDS,
  ATHLETE_FORM_FIELDS,
  ATHLETE_SENSITIVE_DETAIL_FIELDS,
  ATHLETE_SENSITIVE_FORM_FIELDS,
  ATHLETE_ADMIN_ONLY_ACTIONS,
  buildAthletePayload,
} from "../athlete-config";

type Mode = "detail" | "edit";

// <input type="date"> needs "YYYY-MM-DD" — the API sends date fields as
// full ISO datetime strings.
function toDateInputValue(value: unknown): unknown {
  return typeof value === "string" ? value.slice(0, 10) : value;
}

// Prisma Decimal fields (gpa) come back from the API as strings (e.g.
// "3.50"), same as every other Decimal field in this app — but
// ConfigurableForm's number field only converts to a real number on its
// own onChange. A field the admin never touches during edit would
// otherwise resubmit this raw string straight into a schema that
// requires z.number(), failing validation on a save that changed
// nothing about that field.
function toNumberInputValue(value: unknown): unknown {
  return typeof value === "string" && value !== "" ? Number(value) : value;
}

const EMPTY_SENSITIVE_INFO = {
  dateOfBirth: null,
  homeAddress: null,
  governmentIdUrl: null,
};

export function AthleteDetailClient({
  id,
  realRole,
}: {
  id: string;
  realRole: UserRole;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const canManage = ATHLETE_ADMIN_ONLY_ACTIONS.includes(realRole);
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordMissing, setRecordMissing] = useState(false);
  const [recordForbidden, setRecordForbidden] = useState(false);
  const [mode, setMode] = useState<Mode>("detail");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [sensitiveModalOpen, setSensitiveModalOpen] = useState(false);
  const [sensitiveErrors, setSensitiveErrors] = useState<Record<string, string>>({});
  const [sensitiveSubmitting, setSensitiveSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/athletes/${id}`);
        if (res.status === 404) {
          if (!cancelled) setRecordMissing(true);
          return;
        }
        if (res.status === 403) {
          if (!cancelled) setRecordForbidden(true);
          return;
        }
        const body = await res.json().catch(() => null);
        if (cancelled) return;

        if (res.ok && body) {
          setRecord(body.athlete);
        } else {
          showToast("critical", body?.error ?? "Couldn't load this record.");
        }
      } catch {
        if (!cancelled) showToast("critical", "Couldn't reach the server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, showToast]);

  async function handleSubmit(values: Record<string, unknown>) {
    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch(`/api/athletes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildAthletePayload(values)),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok || !body) {
        if (body?.issues) {
          setErrors(zodIssuesToFieldErrors(body.issues));
          showToast("critical", "Fix the highlighted field(s).");
        } else {
          showToast("critical", body?.error ?? "Couldn't save — try again.");
        }
        return;
      }

      // Merge rather than replace — the ADMIN PATCH response does carry
      // sensitiveInfo (same ADMIN_ATHLETE_INCLUDE as GET), so this is
      // harmless either way, but merging is what keeps this save from
      // ever being the thing that could accidentally drop the separate
      // sensitive section's state if that ever changed.
      setRecord((prev) => (prev ? { ...prev, ...body.athlete } : body.athlete));
      showToast("success", "Saved.");
      setMode("detail");
    } catch {
      showToast("critical", "Couldn't reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchive() {
    try {
      const res = await fetch(`/api/athletes/${id}/archive`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showToast("critical", body?.error ?? "Couldn't archive.");
        return;
      }
      setRecord((prev) => (prev ? { ...prev, ...body.athlete } : body.athlete));
      showToast("success", "Archived.");
    } catch {
      showToast("critical", "Couldn't reach the server.");
    }
  }

  async function handleRestore() {
    try {
      const res = await fetch(`/api/athletes/${id}/restore`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showToast("critical", body?.error ?? "Couldn't restore.");
        return;
      }
      setRecord((prev) => (prev ? { ...prev, ...body.athlete } : body.athlete));
      showToast("success", "Restored.");
    } catch {
      showToast("critical", "Couldn't reach the server.");
    }
  }

  async function handleSensitiveSubmit(values: Record<string, unknown>) {
    setSensitiveSubmitting(true);
    setSensitiveErrors({});

    try {
      const res = await fetch(`/api/athletes/${id}/sensitive-info`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildAthletePayload(values)),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok || !body) {
        if (body?.issues) {
          setSensitiveErrors(zodIssuesToFieldErrors(body.issues));
          showToast("critical", "Fix the highlighted field(s).");
        } else {
          showToast("critical", body?.error ?? "Couldn't save — try again.");
        }
        return;
      }

      setRecord((prev) => (prev ? { ...prev, sensitiveInfo: body.sensitiveInfo } : prev));
      showToast("success", "Sensitive information saved.");
      setSensitiveModalOpen(false);
    } catch {
      showToast("critical", "Couldn't reach the server.");
    } finally {
      setSensitiveSubmitting(false);
    }
  }

  if (loading) {
    return (
      <Panel title={ENTITY_LABELS.athlete.singular}>
        <p className="text-sm text-neutral-text">Loading…</p>
      </Panel>
    );
  }

  if (recordMissing) {
    return (
      <Panel title={ENTITY_LABELS.athlete.singular}>
        <p className="text-sm text-neutral-text">This record wasn&apos;t found.</p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => router.push("/athletes")}
        >
          Back to {ENTITY_LABELS.athlete.plural.toLowerCase()}
        </Button>
      </Panel>
    );
  }

  if (recordForbidden || !record) {
    return (
      <Panel title={ENTITY_LABELS.athlete.singular}>
        <p className="text-sm text-neutral-text">
          You don&apos;t have access to this record.
        </p>
      </Panel>
    );
  }

  // The one gate that matters: a key that is genuinely absent from the
  // API response (RECRUITER's NON_ADMIN_ATHLETE_SELECT never names
  // sensitiveInfo) versus present-but-null (ADMIN, no sensitive row yet).
  // Only the first case renders nothing at all — not this component
  // re-deciding by role, the actual response shape deciding for it.
  const hasSensitiveSection = Object.prototype.hasOwnProperty.call(record, "sensitiveInfo");
  const sensitiveData = (record.sensitiveInfo as Record<string, unknown> | null) ?? EMPTY_SENSITIVE_INFO;

  return (
    <div className="space-y-3">
      <Button size="sm" variant="ghost" onClick={() => router.push("/athletes")}>
        ← Back to {ENTITY_LABELS.athlete.plural.toLowerCase()}
      </Button>

      {mode === "detail" ? (
        <ConfigurableDetail
          fields={ATHLETE_DETAIL_FIELDS}
          data={record}
          title={String(record.athleteName)}
          archived={Boolean(record.archived)}
          onEdit={canManage ? () => setMode("edit") : undefined}
          onArchive={canManage ? handleArchive : undefined}
          onRestore={canManage ? handleRestore : undefined}
        />
      ) : (
        <ConfigurableForm
          fields={ATHLETE_FORM_FIELDS}
          role={realRole}
          initialValues={{
            ...record,
            signedDate: toDateInputValue(record.signedDate),
            parentConsentReceivedAt: toDateInputValue(record.parentConsentReceivedAt),
            lastCheckIn: toDateInputValue(record.lastCheckIn),
            nextCheckIn: toDateInputValue(record.nextCheckIn),
            gpa: toNumberInputValue(record.gpa),
          }}
          errors={errors}
          submitting={submitting}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={() => setMode("detail")}
        />
      )}

      {/* Sensitive info: a completely separate section, completely
         separate edit action, calling the dedicated sensitive-info route
         — never the main athlete PATCH. This whole block simply isn't in
         the tree unless hasSensitiveSection is true. */}
      {hasSensitiveSection ? (
        <ConfigurableDetail
          fields={ATHLETE_SENSITIVE_DETAIL_FIELDS}
          data={sensitiveData}
          title="Sensitive Information"
          description="Government ID, date of birth, and home address — visible to Admins only, edited separately from the main record."
          onEdit={() => setSensitiveModalOpen(true)}
        />
      ) : null}

      <Modal
        open={sensitiveModalOpen}
        onClose={() => setSensitiveModalOpen(false)}
        title="Edit Sensitive Information"
        description="Saved through the dedicated sensitive-info endpoint, separate from the main record."
      >
        <ConfigurableForm
          fields={ATHLETE_SENSITIVE_FORM_FIELDS}
          role={realRole}
          initialValues={
            record.sensitiveInfo
              ? {
                  ...(record.sensitiveInfo as Record<string, unknown>),
                  dateOfBirth: toDateInputValue(
                    (record.sensitiveInfo as Record<string, unknown>).dateOfBirth,
                  ),
                }
              : undefined
          }
          errors={sensitiveErrors}
          submitting={sensitiveSubmitting}
          submitLabel="Save"
          onSubmit={handleSensitiveSubmit}
          onCancel={() => setSensitiveModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
