"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/Button";
import { ConfigurableDetail } from "@/components/ConfigurableDetail";
import { ConfigurableForm } from "@/components/ConfigurableForm";
import { Panel } from "@/components/Panel";
import { useToast } from "@/components/ToastProvider";
import { zodIssuesToFieldErrors } from "@/lib/form-config";
import { ENTITY_LABELS } from "@/lib/labels";
import {
  PROSPECT_DETAIL_FIELDS,
  PROSPECT_FORM_FIELDS,
  PROSPECT_ADMIN_ONLY_ACTIONS,
  buildProspectPayload,
} from "../prospect-config";

type Mode = "detail" | "edit";

// <input type="date"> needs "YYYY-MM-DD" — the API sends lastContactDate/
// nextActionDate as full ISO datetime strings.
function toDateInputValue(value: unknown): unknown {
  return typeof value === "string" ? value.slice(0, 10) : value;
}

interface ConvertedAthlete {
  id: string;
  athleteName: string;
  email: string | null;
  phone: string | null;
  position: string | null;
  school: string | null;
  parentGuardianName: string | null;
  parentPhone: string | null;
}

export function ProspectDetailClient({
  id,
  realRole,
}: {
  id: string;
  realRole: UserRole;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const canManage = PROSPECT_ADMIN_ONLY_ACTIONS.includes(realRole);
  const [record, setRecord] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [recordMissing, setRecordMissing] = useState(false);
  const [recordForbidden, setRecordForbidden] = useState(false);
  const [mode, setMode] = useState<Mode>("detail");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [converting, setConverting] = useState(false);
  const [convertedAthlete, setConvertedAthlete] = useState<ConvertedAthlete | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/prospects/${id}`);
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
          setRecord(body.prospect);
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
      const res = await fetch(`/api/prospects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildProspectPayload(values)),
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

      setRecord(body.prospect);
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
      const res = await fetch(`/api/prospects/${id}/archive`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showToast("critical", body?.error ?? "Couldn't archive.");
        return;
      }
      setRecord(body.prospect);
      showToast("success", "Archived.");
    } catch {
      showToast("critical", "Couldn't reach the server.");
    }
  }

  async function handleRestore() {
    try {
      const res = await fetch(`/api/prospects/${id}/restore`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showToast("critical", body?.error ?? "Couldn't restore.");
        return;
      }
      setRecord(body.prospect);
      showToast("success", "Restored.");
    } catch {
      showToast("critical", "Couldn't reach the server.");
    }
  }

  async function handleConvert() {
    setConverting(true);
    try {
      const res = await fetch(`/api/prospects/${id}/convert`, { method: "POST" });
      const body = await res.json().catch(() => null);

      if (!res.ok || !body) {
        // The real backend rejection reason, verbatim — not a made-up
        // client-side message. jsonError() always shapes { error }.
        showToast("critical", body?.error ?? "Couldn't convert — try again.");
        return;
      }

      setConvertedAthlete(body.athlete);
      setRecord((prev) =>
        prev ? { ...prev, convertedToAthleteId: body.athlete.id } : prev,
      );
      showToast("success", `Converted to Athlete: ${body.athlete.athleteName}.`);
    } catch {
      showToast("critical", "Couldn't reach the server.");
    } finally {
      setConverting(false);
    }
  }

  if (loading) {
    return (
      <Panel title={ENTITY_LABELS.prospect.singular}>
        <p className="text-sm text-neutral-text">Loading…</p>
      </Panel>
    );
  }

  if (recordMissing) {
    return (
      <Panel title={ENTITY_LABELS.prospect.singular}>
        <p className="text-sm text-neutral-text">This record wasn&apos;t found.</p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => router.push("/prospects")}
        >
          Back to {ENTITY_LABELS.prospect.plural.toLowerCase()}
        </Button>
      </Panel>
    );
  }

  if (recordForbidden || !record) {
    return (
      <Panel title={ENTITY_LABELS.prospect.singular}>
        <p className="text-sm text-neutral-text">
          You don&apos;t have access to this record.
        </p>
      </Panel>
    );
  }

  const status = String(record.status ?? "");
  const alreadyConverted = Boolean(record.convertedToAthleteId) || Boolean(convertedAthlete);
  const eligibleToConvert = status === "SIGNED" && !alreadyConverted;

  return (
    <div className="space-y-3">
      <Button size="sm" variant="ghost" onClick={() => router.push("/prospects")}>
        ← Back to {ENTITY_LABELS.prospect.plural.toLowerCase()}
      </Button>

      {convertedAthlete ? (
        <Panel title="Converted to Athlete" icon={CheckCircle2}>
          <div className="space-y-1 text-sm text-surface-navy">
            <p className="font-semibold">{convertedAthlete.athleteName}</p>
            <p className="text-neutral-text">Athlete ID: {convertedAthlete.id}</p>
            <p className="text-neutral-text">
              Email, phone, position, school, and parent/guardian contact were
              carried over from this Prospect.
            </p>
            <p className="mt-2 text-xs text-neutral-text">
              Athlete detail pages aren&apos;t built yet — this is the record{" "}
              <code>GET /api/athletes/{convertedAthlete.id}</code> now returns.
            </p>
          </div>
        </Panel>
      ) : null}

      {mode === "detail" ? (
        <>
          <ConfigurableDetail
            fields={PROSPECT_DETAIL_FIELDS}
            data={record}
            title={String(record.fullName)}
            archived={Boolean(record.archived)}
            onEdit={() => setMode("edit")}
            onArchive={canManage ? handleArchive : undefined}
            onRestore={canManage ? handleRestore : undefined}
          />

          {canManage ? (
            <Panel title="Convert to Athlete">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-neutral-text">
                  {alreadyConverted
                    ? "This Prospect has already been converted to an Athlete."
                    : eligibleToConvert
                      ? "This Prospect is Signed and ready to convert."
                      : `Available once this Prospect's status is Signed (currently ${status || "unset"}).`}
                </p>
                <Button
                  size="sm"
                  onClick={handleConvert}
                  disabled={!eligibleToConvert}
                  loading={converting}
                >
                  Convert to Athlete
                </Button>
              </div>
            </Panel>
          ) : null}
        </>
      ) : (
        <ConfigurableForm
          fields={PROSPECT_FORM_FIELDS}
          role={realRole}
          initialValues={{
            ...record,
            lastContactDate: toDateInputValue(record.lastContactDate),
            nextActionDate: toDateInputValue(record.nextActionDate),
          }}
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
