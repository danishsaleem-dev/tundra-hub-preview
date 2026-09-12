"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { Button } from "@/components/Button";
import { ConfigurableDetail } from "@/components/ConfigurableDetail";
import { ConfigurableForm } from "@/components/ConfigurableForm";
import { Panel } from "@/components/Panel";
import { useToast } from "@/components/ToastProvider";
import { zodIssuesToFieldErrors } from "@/lib/form-config";
import { ENTITY_LABELS } from "@/lib/labels";
import {
  RECRUITER_DETAIL_FIELDS,
  RECRUITER_FORM_FIELDS,
  buildRecruiterPayload,
} from "../recruiter-config";

type Mode = "detail" | "edit";

// <input type="date"> needs "YYYY-MM-DD" — Prisma/the API sends startDate
// as a full ISO datetime string, so the edit form's initial value has to
// be trimmed here rather than in the shared ConfigurableForm/form-config
// layer, which knows nothing about any one field's real format.
function toDateInputValue(value: unknown): unknown {
  return typeof value === "string" ? value.slice(0, 10) : value;
}

export function RecruiterDetailClient({
  id,
  realRole,
}: {
  id: string;
  realRole: UserRole;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordMissing, setRecordMissing] = useState(false);
  const [recordForbidden, setRecordForbidden] = useState(false);
  const [mode, setMode] = useState<Mode>("detail");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/recruiters/${id}`);
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
          setRecord(body.recruiter);
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
      const res = await fetch(`/api/recruiters/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRecruiterPayload(values)),
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

      setRecord(body.recruiter);
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
      const res = await fetch(`/api/recruiters/${id}/archive`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showToast("critical", body?.error ?? "Couldn't archive.");
        return;
      }
      setRecord(body.recruiter);
      showToast("success", "Archived.");
    } catch {
      showToast("critical", "Couldn't reach the server.");
    }
  }

  async function handleRestore() {
    try {
      const res = await fetch(`/api/recruiters/${id}/restore`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showToast("critical", body?.error ?? "Couldn't restore.");
        return;
      }
      setRecord(body.recruiter);
      showToast("success", "Restored.");
    } catch {
      showToast("critical", "Couldn't reach the server.");
    }
  }

  if (loading) {
    return (
      <Panel title={ENTITY_LABELS.recruiter.singular}>
        <p className="text-sm text-neutral-text">Loading…</p>
      </Panel>
    );
  }

  if (recordMissing) {
    return (
      <Panel title={ENTITY_LABELS.recruiter.singular}>
        <p className="text-sm text-neutral-text">This record wasn&apos;t found.</p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => router.push("/recruiters")}
        >
          Back to {ENTITY_LABELS.recruiter.plural.toLowerCase()}
        </Button>
      </Panel>
    );
  }

  if (recordForbidden || !record) {
    return (
      <Panel title={ENTITY_LABELS.recruiter.singular}>
        <p className="text-sm text-neutral-text">
          You don&apos;t have access to this record.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-3">
      <Button size="sm" variant="ghost" onClick={() => router.push("/recruiters")}>
        ← Back to {ENTITY_LABELS.recruiter.plural.toLowerCase()}
      </Button>

      {mode === "detail" ? (
        <ConfigurableDetail
          fields={RECRUITER_DETAIL_FIELDS}
          data={record}
          title={String(record.name)}
          archived={Boolean(record.archived)}
          onEdit={() => setMode("edit")}
          onArchive={realRole === "ADMIN" ? handleArchive : undefined}
          onRestore={realRole === "ADMIN" ? handleRestore : undefined}
        />
      ) : (
        <ConfigurableForm
          fields={RECRUITER_FORM_FIELDS}
          role={realRole}
          initialValues={{ ...record, startDate: toDateInputValue(record.startDate) }}
          errors={errors}
          submitting={submitting}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={() => setMode("detail")}
        />
      )}
    </div>
  );
}
