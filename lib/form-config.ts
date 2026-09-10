// Deliberately NOT "server-only" — this config/logic layer is used by
// both the server (each module's form config + route handlers) and the
// client (components/ConfigurableForm.tsx renders with it directly).
import type { UserRole } from "@prisma/client";
import { resolveEntityAwareLabel } from "@/lib/labels";

// The shared config shape every M5 module's form will configure, rather
// than building its own form from scratch. This file is the config layer
// only (types + pure helpers) — components/ConfigurableForm.tsx is the
// rendering layer that consumes it.
export type FieldType =
  | "text"
  | "number"
  | "date"
  | "textarea"
  | "boolean"
  | "select"
  | "multiselect";

export interface FieldOption {
  value: string;
  label: string;
}

export interface FormFieldConfig {
  name: string;
  type: FieldType;
  /** Explicit override. Omit to derive from the entity-label lookup (for
   * fields that name one of the five tracked entities, e.g. recruiterId)
   * or humanizeFieldName as the fallback — never hardcode a label here
   * when one of those two already produces the right text. */
  label?: string;
  placeholder?: string;
  /** Required for "select" and "multiselect" — options come from
   * configuration (real enum values), never hardcoded per form. */
  options?: FieldOption[];
  required?: boolean;
  helpText?: string;
  /** Roles allowed to see and edit this field. Omit to allow every role
   * the form is rendered for. This is enforced by never including the
   * field in the rendered set at all (see fieldsForRole) — the same
   * structural-exclusion the API layer already uses for
   * NON_ADMIN_ATHLETE_SELECT-style responses, not a disabled input. */
  roles?: UserRole[];
}

export function resolveFieldLabel(field: FormFieldConfig): string {
  return resolveEntityAwareLabel(field.name, field.label);
}

// The structural-exclusion filter — a field with `roles` set that doesn't
// include the caller's role is dropped here, before anything ever maps
// over the array into JSX. There is no "render then disable" branch
// anywhere in this system.
export function fieldsForRole(
  fields: FormFieldConfig[],
  role: UserRole,
): FormFieldConfig[] {
  return fields.filter((field) => !field.roles || field.roles.includes(role));
}

function defaultValueForField(field: FormFieldConfig): unknown {
  switch (field.type) {
    case "boolean":
      return false;
    case "multiselect":
      return [];
    default:
      return "";
  }
}

// Builds the form's initial state from only the fields visible to this
// role — an edit-mode value for a field the current role can't see must
// never end up in form state at all (it would otherwise ride along in the
// submitted payload even though nothing rendered it, which a strict
// server-side schema would then reject as an unrecognized key).
export function buildInitialValues(
  visibleFields: FormFieldConfig[],
  initialValues?: Record<string, unknown>,
): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const field of visibleFields) {
    const provided = initialValues?.[field.name];
    values[field.name] = provided === undefined || provided === null
      ? defaultValueForField(field)
      : provided;
  }
  return values;
}

export interface ZodIssueLike {
  path: (string | number)[];
  message: string;
}

// Converts the { error, issues } shape jsonValidationError() already
// produces into { [fieldName]: message } for inline rendering — the
// server stays the real authority on what's valid, this only maps its
// answer onto specific fields instead of a single generic toast.
export function zodIssuesToFieldErrors(
  issues: ZodIssueLike[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of issues) {
    const field = String(issue.path[0] ?? "");
    if (field && !(field in errors)) errors[field] = issue.message;
  }
  return errors;
}
