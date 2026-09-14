"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole, PaymentStatus } from "@prisma/client";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/Button";
import { ConfigurableDetail } from "@/components/ConfigurableDetail";
import { ConfigurableForm } from "@/components/ConfigurableForm";
import { ListRow } from "@/components/ListRow";
import { StatusChip } from "@/components/StatusChip";
import { Panel } from "@/components/Panel";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/ToastProvider";
import { zodIssuesToFieldErrors, type FieldOption } from "@/lib/form-config";
import { ENTITY_LABELS } from "@/lib/labels";
import { formatCurrency } from "@/lib/format";
import { paymentStatusChip } from "@/lib/payment-display";
import {
  NIL_DEAL_DETAIL_FIELDS,
  buildNilDealFormFields,
  buildNilDealPayload,
  fetchAthleteOptions,
} from "../nil-deal-config";

type Mode = "detail" | "edit";
const ADMIN_ONLY: UserRole[] = ["ADMIN"];

interface LinkedPayment {
  id: string;
  paymentName: string;
  amountOutstanding: string;
  status: PaymentStatus;
  isOverdue: boolean;
  isAutoCreated: boolean;
}

// <input type="date"> needs "YYYY-MM-DD" — the API sends date fields as
// full ISO datetime strings.
function toDateInputValue(value: unknown): unknown {
  return typeof value === "string" ? value.slice(0, 10) : value;
}

// Prisma Decimal fields (dealValue, agencyFee, athleteNet) come back from
// the API as strings (e.g. "5000.00"), same reasoning as every other
// Decimal field in this app — but ConfigurableForm's number field only
// converts to a real number on its own onChange; a field the admin never
// touches during edit would otherwise resubmit this raw string straight
// into a schema that requires z.number(), failing validation on a save
// that changed nothing about that field.
function toNumberInputValue(value: unknown): unknown {
  return typeof value === "string" && value !== "" ? Number(value) : value;
}

export function NilDealDetailClient({
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

  const [athleteOptions, setAthleteOptions] = useState<FieldOption[]>([]);
  const [athleteOptionsLoaded, setAthleteOptionsLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(`/api/nil-deals/${id}`);
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
          setRecord(body.nilDeal);
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

  // Only ADMIN ever reaches edit mode — fetch the athlete picker's
  // options once, lazily, rather than on every page load for a
  // RECRUITER who will never see the form.
  useEffect(() => {
    if (!canManage || mode !== "edit" || athleteOptionsLoaded) return;
    let cancelled = false;
    fetchAthleteOptions().then((options) => {
      if (!cancelled) {
        setAthleteOptions(options);
        setAthleteOptionsLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [canManage, mode, athleteOptionsLoaded]);

  async function handleSubmit(values: Record<string, unknown>) {
    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch(`/api/nil-deals/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildNilDealPayload(values)),
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

      setRecord(body.nilDeal);
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
      const res = await fetch(`/api/nil-deals/${id}/archive`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showToast("critical", body?.error ?? "Couldn't archive.");
        return;
      }
      setRecord((prev) => (prev ? { ...prev, ...body.nilDeal } : body.nilDeal));
      showToast("success", "Archived.");
    } catch {
      showToast("critical", "Couldn't reach the server.");
    }
  }

  async function handleRestore() {
    try {
      const res = await fetch(`/api/nil-deals/${id}/restore`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showToast("critical", body?.error ?? "Couldn't restore.");
        return;
      }
      setRecord((prev) => (prev ? { ...prev, ...body.nilDeal } : body.nilDeal));
      showToast("success", "Restored.");
    } catch {
      showToast("critical", "Couldn't reach the server.");
    }
  }

  if (loading) {
    return (
      <Panel title={ENTITY_LABELS.nilDeal.singular}>
        <p className="text-sm text-neutral-text">Loading…</p>
      </Panel>
    );
  }

  if (recordMissing) {
    return (
      <Panel title={ENTITY_LABELS.nilDeal.singular}>
        <p className="text-sm text-neutral-text">This record wasn&apos;t found.</p>
        <Button
          size="sm"
          variant="outline"
          className="mt-3"
          onClick={() => router.push("/nil-deals")}
        >
          Back to {ENTITY_LABELS.nilDeal.plural}
        </Button>
      </Panel>
    );
  }

  if (recordForbidden || !record) {
    return (
      <Panel title={ENTITY_LABELS.nilDeal.singular}>
        <p className="text-sm text-neutral-text">
          You don&apos;t have access to this record.
        </p>
      </Panel>
    );
  }

  const payments = (record.payments as LinkedPayment[] | undefined) ?? [];

  return (
    <div className="space-y-3">
      <Button size="sm" variant="ghost" onClick={() => router.push("/nil-deals")}>
        ← Back to {ENTITY_LABELS.nilDeal.plural}
      </Button>

      {mode === "detail" ? (
        <ConfigurableDetail
          fields={NIL_DEAL_DETAIL_FIELDS}
          data={record}
          title={String(record.dealName)}
          archived={Boolean(record.archived)}
          onEdit={canManage ? () => setMode("edit") : undefined}
          onArchive={canManage ? handleArchive : undefined}
          onRestore={canManage ? handleRestore : undefined}
        />
      ) : athleteOptionsLoaded ? (
        <ConfigurableForm
          fields={buildNilDealFormFields(athleteOptions)}
          role={realRole}
          initialValues={{
            ...record,
            deadline: toDateInputValue(record.deadline),
            dealValue: toNumberInputValue(record.dealValue),
            agencyFee: toNumberInputValue(record.agencyFee),
            athleteNet: toNumberInputValue(record.athleteNet),
          }}
          errors={errors}
          submitting={submitting}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={() => setMode("detail")}
        />
      ) : (
        <p className="text-sm text-neutral-text">Loading…</p>
      )}

      <Panel title="Linked Payments">
        {payments.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title={`No ${ENTITY_LABELS.payment.plural.toLowerCase()} yet`}
            description={`${ENTITY_LABELS.payment.plural} for this deal will show up here once they exist — including the one created automatically when the deal is marked Signed.`}
          />
        ) : (
          <ul className="divide-y divide-card-tint">
            {payments.map((payment) => {
              const chip = paymentStatusChip(payment);
              return (
                <ListRow
                  key={payment.id}
                  title={payment.paymentName}
                  meta={payment.isAutoCreated ? "Auto-created" : "Manually added"}
                  trailing={
                    <>
                      <span className="text-sm font-semibold text-surface-navy">
                        {formatCurrency(payment.amountOutstanding)}
                      </span>
                      <StatusChip variant={chip.variant} label={chip.label} />
                    </>
                  }
                />
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
