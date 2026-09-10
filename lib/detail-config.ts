// Deliberately NOT "server-only" — used by both server (each module's
// detail config) and client (components/ConfigurableDetail.tsx).
import type { StatusVariant } from "@/lib/status";
import { resolveEntityAwareLabel } from "@/lib/labels";

export type DetailFieldType =
  | "text"
  | "textarea"
  | "number"
  | "date"
  | "boolean"
  | "currency"
  | "status";

export interface StatusFieldOption {
  variant: StatusVariant;
  label: string;
}

export interface DetailFieldConfig {
  key: string;
  type: DetailFieldType;
  label?: string;
  statusMap?: Record<string, StatusFieldOption>;
  /** Long-text fields (notes, etc.) span both columns of the detail
   * grid instead of sharing a row. */
  fullWidth?: boolean;
}

export function resolveDetailFieldLabel(field: DetailFieldConfig): string {
  return resolveEntityAwareLabel(field.key, field.label);
}

// Deliberately no role-based filtering here, unlike fieldsForRole()/
// columnsForRole() in the form and list configs. The detail view's own
// structural-exclusion guarantee is different by design: it must reflect
// exactly what the API actually sent for the viewing role, not a second,
// separately-maintained client-side permission list that could drift
// from the server's real behavior. A field whose key the API didn't
// include at all (Prisma `select`/`include` shaping the response, e.g.
// NON_ADMIN_ATHLETE_SELECT) is filtered out here purely because the key
// is genuinely absent from the data object — not because some config
// says role X can't see it. hasOwnProperty, not a null/undefined check:
// a field the API sent with a real null value (not yet filled in) must
// still render, only a field whose key was never sent should disappear.
export function fieldsPresentInData(
  fields: DetailFieldConfig[],
  data: Record<string, unknown>,
): DetailFieldConfig[] {
  return fields.filter((field) =>
    Object.prototype.hasOwnProperty.call(data, field.key),
  );
}
