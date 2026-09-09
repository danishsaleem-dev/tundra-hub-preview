"use client";

import { useMemo, useState } from "react";
import type { UserRole } from "@prisma/client";
import { TextField } from "@/components/TextField";
import { TextareaField } from "@/components/TextareaField";
import { SelectField } from "@/components/SelectField";
import { Checkbox } from "@/components/Checkbox";
import { Button } from "@/components/Button";
import { cn } from "@/lib/cn";
import {
  fieldsForRole,
  buildInitialValues,
  resolveFieldLabel,
  type FormFieldConfig,
} from "@/lib/form-config";

interface FieldErrorProps {
  message?: string;
}

function FieldError({ message }: FieldErrorProps) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-critical-text">{message}</p>;
}

interface FieldRendererProps {
  field: FormFieldConfig;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
}

function FieldRenderer({ field, value, error, onChange }: FieldRendererProps) {
  const label = resolveFieldLabel(field);
  const containerClassName =
    field.type === "textarea" || field.type === "multiselect"
      ? "sm:col-span-2"
      : undefined;

  switch (field.type) {
    case "text":
      return (
        <div className={containerClassName}>
          <TextField
            label={label}
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <FieldError message={error} />
        </div>
      );

    case "number":
      return (
        <div className={containerClassName}>
          <TextField
            label={label}
            type="number"
            placeholder={field.placeholder}
            value={value === "" || value === null || value === undefined ? "" : String(value)}
            onChange={(e) =>
              onChange(e.target.value === "" ? "" : Number(e.target.value))
            }
          />
          <FieldError message={error} />
        </div>
      );

    case "date":
      return (
        <div className={containerClassName}>
          <TextField
            label={label}
            type="date"
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <FieldError message={error} />
        </div>
      );

    case "textarea":
      return (
        <div className={containerClassName}>
          <TextareaField
            label={label}
            placeholder={field.placeholder}
            value={(value as string) ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
          <FieldError message={error} />
        </div>
      );

    case "boolean":
      return (
        <div className={cn(containerClassName, "flex items-center")}>
          <Checkbox
            label={label}
            description={field.helpText}
            checked={Boolean(value)}
            onChange={(checked) => onChange(checked)}
          />
          <FieldError message={error} />
        </div>
      );

    case "select":
      return (
        <div className={containerClassName}>
          <SelectField
            label={label}
            options={field.options ?? []}
            value={(value as string) ?? ""}
            onChange={(next) => onChange(next)}
          />
          <FieldError message={error} />
        </div>
      );

    case "multiselect": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div className={containerClassName}>
          <p className="text-sm font-semibold text-surface-navy">{label}</p>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-2">
            {(field.options ?? []).map((option) => (
              <Checkbox
                key={option.value}
                label={option.label}
                checked={selected.includes(option.value)}
                onChange={(checked) =>
                  onChange(
                    checked
                      ? [...selected, option.value]
                      : selected.filter((v) => v !== option.value),
                  )
                }
              />
            ))}
          </div>
          <FieldError message={error} />
        </div>
      );
    }
  }
}

export interface ConfigurableFormProps {
  fields: FormFieldConfig[];
  /** The real signed-in caller's role — not a UI preview state. Only
   * fields this role is allowed to edit are ever rendered. */
  role: UserRole;
  /** Present for edit mode (pre-populated); omit for create mode (each
   * visible field starts at its type's empty value). */
  initialValues?: Record<string, unknown>;
  /** Server-side validation errors, keyed by field name — the server
   * stays the real authority, this only routes its answer to the field
   * that actually failed instead of a generic toast. */
  errors?: Record<string, string>;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: Record<string, unknown>) => void;
  onCancel?: () => void;
}

export function ConfigurableForm({
  fields,
  role,
  initialValues,
  errors,
  submitting = false,
  submitLabel = "Save",
  onSubmit,
  onCancel,
}: ConfigurableFormProps) {
  // The only place role-based filtering happens — every field mapped into
  // JSX below comes from this array, so a field outside `role`'s
  // permission is never in the tree, not merely disabled inside it.
  const visibleFields = useMemo(
    () => fieldsForRole(fields, role),
    [fields, role],
  );

  const [values, setValues] = useState<Record<string, unknown>>(() =>
    buildInitialValues(visibleFields, initialValues),
  );

  function updateField(name: string, value: unknown) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      {visibleFields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={values[field.name]}
          error={errors?.[field.name]}
          onChange={(value) => updateField(field.name, value)}
        />
      ))}

      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" loading={submitting}>
          {submitLabel}
        </Button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}
