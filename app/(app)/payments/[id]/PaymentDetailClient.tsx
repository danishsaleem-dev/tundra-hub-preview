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
  PAYMENT_DETAIL_FIELDS,
  PAYMENT_ADMIN_ONLY_ACTIONS,
  buildPaymentFormFields,
  buildPaymentPayload,
} from "../payment-config";

type Mode = "detail" | "edit";
const ADMIN_ONLY: UserRole[] = PAYMENT_ADMIN_ONLY_ACTIONS;

function toDateInputValue(value: unknown): unknown {
  return typeof value === "string" ? value.slice(0, 10) : value;
}

// Prisma Decimal fields (paymentAmount, amountPaid) come back from the
// API as strings — same fix already applied to Recruiter's
// revenueInfluenced, Athlete's gpa, and NIL Deal's dealValue/agencyFee/
// athleteNet. A field the admin never touches during edit would
// otherwise resubmit this raw string into a schema requiring
// z.number(), failing validation on a save that changed nothing about
// that field.
function toNumberInputValue(value: unknown): unknown {
  return typeof value === "string" && value !== "" ? Number(value) : value;
}

export function PaymentDetailClient({
  id,
  realRole,
}: {
  id: string;
  realRole: UserRole;
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const canManage = ADMIN_ONLY.includes(realRole);
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
        const res = await fetch(`/api/payments/${id}`);
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
          setRecord(body.payment);
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
      const res = await fetch(`/api/payments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPaymentPayload(values)),
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

      setRecord(body.payment);
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
      const res = await fetch(`/api/payments/${id}/archive`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showToast("critical", body?.error ?? "Couldn't archive.");
        return;
      }
      setRecord((prev) => (prev ? { ...prev, ...body.payment } : body.payment));
      showToast("success", "Archived.");
    } catch {
      showToast("critical", "Couldn't reach the server.");
    }
  }

  async function handleRestore() {
    try {
      const res = await fetch(`/api/payments/${id}/restore`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showToast("critical", body?.error ?? "Couldn't restore.");
        return;
      }
      setRecord((prev) => (prev ? { ...prev, ...body.payment } : body.payment));
      showToast("success", "Restored.");
    } catch {
      showToast("critical", "Couldn't reach the server.");
    }
  }

  if (loading) {
    return (
      <Panel title={ENTITY_LABELS.payment.singular}>
        <p className="text-sm text-neutral-text">Loading…</p>
      </Panel>
    );
  }

  if (recordMissing) {
    return (
      <Panel title={ENTITY_LABELS.payment.singular}>
        <p className="text-sm text-neutral-text">This record wasn&apos;t found.</p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => router.push("/payments")}
        >
          Back to {ENTITY_LABELS.payment.plural.toLowerCase()}
        </Button>
      </Panel>
    );
  }

  if (recordForbidden || !record) {
    return (
      <Panel title={ENTITY_LABELS.payment.singular}>
        <p className="text-sm text-neutral-text">
          You don&apos;t have access to this record.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-3">
      <Button size="sm" variant="ghost" onClick={() => router.push("/payments")}>
        ← Back to {ENTITY_LABELS.payment.plural.toLowerCase()}
      </Button>

      {mode === "detail" ? (
        <ConfigurableDetail
          fields={PAYMENT_DETAIL_FIELDS}
          data={record}
          title={String(record.paymentName)}
          archived={Boolean(record.archived)}
          onEdit={canManage ? () => setMode("edit") : undefined}
          onArchive={canManage ? handleArchive : undefined}
          onRestore={canManage ? handleRestore : undefined}
        />
      ) : (
        <ConfigurableForm
          fields={buildPaymentFormFields(null)}
          role={realRole}
          initialValues={{
            ...record,
            paymentAmount: toNumberInputValue(record.paymentAmount),
            amountPaid: toNumberInputValue(record.amountPaid),
            dueDate: toDateInputValue(record.dueDate),
            paymentDate: toDateInputValue(record.paymentDate),
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
