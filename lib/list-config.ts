// Deliberately NOT "server-only" — like form-config.ts, this config/logic
// layer is used by both the server (each module's list config) and the
// client (components/ConfigurableList.tsx renders with it directly).
import type { UserRole } from "@prisma/client";
import type { StatusVariant } from "@/lib/status";
import { resolveEntityAwareLabel } from "@/lib/labels";

export type ListColumnType =
  | "text"
  | "number"
  | "date"
  | "boolean"
  | "currency"
  | "status";

export interface StatusColumnOption {
  variant: StatusVariant;
  label: string;
}

export interface ListColumnConfig {
  key: string;
  type: ListColumnType;
  label?: string;
  align?: "left" | "right";
  /** Required for type "status" — maps a raw enum value (e.g. "SIGNED")
   * to the StatusChip variant/label to render, from real configured
   * values, never hardcoded per list. */
  statusMap?: Record<string, StatusColumnOption>;
  /** Roles allowed to see this column. Omit to allow every role the list
   * is rendered for — same structural-exclusion as form fields, enforced
   * by never including the column at all (see columnsForRole), not a
   * hidden-but-present <td>. */
  roles?: UserRole[];
}

export interface ListFilterOption {
  value: string;
  label: string;
}

export interface ListFilterConfig {
  key: string;
  type: "select" | "text";
  label?: string;
  /** Required for type "select" — options come from configuration (real
   * enum values), never hardcoded per list. */
  options?: ListFilterOption[];
  roles?: UserRole[];
}

export function resolveColumnLabel(column: ListColumnConfig): string {
  return resolveEntityAwareLabel(column.key, column.label);
}

export function resolveFilterLabel(filter: ListFilterConfig): string {
  return resolveEntityAwareLabel(filter.key, filter.label);
}

export function columnsForRole(
  columns: ListColumnConfig[],
  role: UserRole,
): ListColumnConfig[] {
  return columns.filter((column) => !column.roles || column.roles.includes(role));
}

export function filtersForRole(
  filters: ListFilterConfig[],
  role: UserRole,
): ListFilterConfig[] {
  return filters.filter((filter) => !filter.roles || filter.roles.includes(role));
}
