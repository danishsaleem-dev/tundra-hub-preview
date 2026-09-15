"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ConfigurableForm } from "@/components/ConfigurableForm";
import { Panel } from "@/components/Panel";
import { useToast } from "@/components/ToastProvider";
import { zodIssuesToFieldErrors, type FieldOption } from "@/lib/form-config";
import { ENTITY_LABELS } from "@/lib/labels";
import {
  buildPaymentFormFields,
  buildPaymentPayload,
  fetchNilDealOptions,
} from "../payment-config";

export function PaymentCreateClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [nilDealOptions, setNilDealOptions] = useState<FieldOption[]>([]);
  const [loadingDeals, setLoadingDeals] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchNilDealOptions().then((options) => {
      if (!cancelled) {
        setNilDealOptions(options);
        setLoadingDeals(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(values: Record<string, unknown>) {
    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPaymentPayload(values)),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok || !body) {
        if (body?.issues) {
          setErrors(zodIssuesToFieldErrors(body.issues));
          showToast("critical", "Fix the highlighted field(s).");
        } else {
          showToast("critical", body?.error ?? "Couldn't create — try again.");
        }
        return;
      }

      showToast("success", `${ENTITY_LABELS.payment.singular} created.`);
      router.push(`/payments/${body.payment.id}`);
    } catch {
      showToast("critical", "Couldn't reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Panel title={`New ${ENTITY_LABELS.payment.singular}`}>
      {loadingDeals ? (
        <p className="text-sm text-neutral-text">Loading…</p>
      ) : (
        <ConfigurableForm
          fields={buildPaymentFormFields(nilDealOptions)}
          role="ADMIN"
          errors={errors}
          submitting={submitting}
          submitLabel="Create"
          onSubmit={handleSubmit}
          onCancel={() => router.push("/payments")}
        />
      )}
    </Panel>
  );
}
