"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfigurableForm } from "@/components/ConfigurableForm";
import { Panel } from "@/components/Panel";
import { useToast } from "@/components/ToastProvider";
import { zodIssuesToFieldErrors } from "@/lib/form-config";
import { ENTITY_LABELS } from "@/lib/labels";
import { PROSPECT_FORM_FIELDS, buildProspectPayload } from "../prospect-config";

export function ProspectCreateClient() {
  const router = useRouter();
  const { showToast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: Record<string, unknown>) {
    setSubmitting(true);
    setErrors({});

    try {
      const res = await fetch("/api/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildProspectPayload(values)),
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

      showToast("success", `${ENTITY_LABELS.prospect.singular} created.`);
      router.push(`/prospects/${body.prospect.id}`);
    } catch {
      showToast("critical", "Couldn't reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Panel title={`New ${ENTITY_LABELS.prospect.singular}`}>
      <ConfigurableForm
        fields={PROSPECT_FORM_FIELDS}
        role="ADMIN"
        errors={errors}
        submitting={submitting}
        submitLabel="Create"
        onSubmit={handleSubmit}
        onCancel={() => router.push("/prospects")}
      />
    </Panel>
  );
}
