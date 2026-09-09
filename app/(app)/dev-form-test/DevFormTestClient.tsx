"use client";

import { useState } from "react";
import type { UserRole } from "@prisma/client";
import { ConfigurableForm } from "@/components/ConfigurableForm";
import { Panel } from "@/components/Panel";
import { useToast } from "@/components/ToastProvider";
import { zodIssuesToFieldErrors, type FormFieldConfig } from "@/lib/form-config";

// Representative mix of every field type ConfigurableForm supports, plus
// one role-restricted field (internalScore, ADMIN only) — this is the
// thing that has to genuinely disappear from the DOM for Recruiter/
// Athlete, not just render disabled.
const TEST_FORM_FIELDS: FormFieldConfig[] = [
  { name: "name", type: "text", required: true, placeholder: "e.g. Test Record" },
  { name: "amount", type: "number", placeholder: "0" },
  { name: "dueDate", type: "date" },
  { name: "notes", type: "textarea", placeholder: "Optional notes" },
  { name: "active", type: "boolean" },
  {
    name: "status",
    type: "select",
    options: [
      { value: "DRAFT", label: "Draft" },
      { value: "ACTIVE", label: "Active" },
      { value: "DONE", label: "Done" },
    ],
  },
  {
    name: "tags",
    type: "multiselect",
    options: [
      { value: "A", label: "Tag A" },
      { value: "B", label: "Tag B" },
      { value: "C", label: "Tag C" },
    ],
  },
  {
    name: "internalScore",
    type: "number",
    roles: ["ADMIN"],
    helpText: "Admin-only field — proves structural exclusion for every other role.",
  },
];

export function DevFormTestClient({ realRole }: { realRole: UserRole }) {
  const { showToast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<unknown>(null);

  async function handleSubmit(values: Record<string, unknown>) {
    setSubmitting(true);
    setErrors({});
    setLastResult(null);

    try {
      const res = await fetch("/api/dev-form-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = await res.json().catch(() => null);

      if (!res.ok || !body) {
        if (body?.issues) {
          setErrors(zodIssuesToFieldErrors(body.issues));
          showToast("critical", "Fix the highlighted field(s).");
        } else {
          showToast("critical", body?.error ?? "Couldn't validate — try again.");
        }
        return;
      }

      setLastResult(body.result);
      showToast("success", "Validated and accepted by the server.");
    } catch {
      showToast("critical", "Couldn't reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <Panel
        title="Form System Test Harness"
        description={`Signed in as ${realRole} — fields outside this role's permission are not in the DOM at all, not just disabled.`}
      >
        <ConfigurableForm
          fields={TEST_FORM_FIELDS}
          role={realRole}
          errors={errors}
          submitting={submitting}
          submitLabel="Validate"
          onSubmit={handleSubmit}
        />
      </Panel>

      {lastResult ? (
        <Panel title="Last Accepted Payload">
          <pre className="overflow-x-auto text-xs text-neutral-text">
            {JSON.stringify(lastResult, null, 2)}
          </pre>
        </Panel>
      ) : null}
    </div>
  );
}
