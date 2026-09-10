"use client";

import type { ReactNode } from "react";
import { Panel } from "@/components/Panel";
import { Button } from "@/components/Button";
import { StatusChip } from "@/components/StatusChip";
import { formatCurrency } from "@/lib/format";
import {
  fieldsPresentInData,
  resolveDetailFieldLabel,
  type DetailFieldConfig,
} from "@/lib/detail-config";

function renderDetailValue(field: DetailFieldConfig, value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") {
    return field.type === "boolean" ? "No" : "—";
  }

  switch (field.type) {
    case "currency":
      return formatCurrency(value as string | number);
    case "boolean":
      return value ? "Yes" : "No";
    case "date": {
      const date = new Date(value as string);
      return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
    }
    case "status": {
      const option = field.statusMap?.[String(value)];
      return (
        <StatusChip
          variant={option?.variant ?? "neutral"}
          label={option?.label ?? String(value)}
        />
      );
    }
    case "textarea":
      return <p className="whitespace-pre-wrap">{String(value)}</p>;
    case "number":
    case "text":
    default:
      return String(value);
  }
}

export interface ConfigurableDetailProps<TData extends Record<string, unknown>> {
  fields: DetailFieldConfig[];
  /** Whatever the API actually returned for the viewing role — a field
   * configured here but not a key on this object simply doesn't render
   * (see fieldsPresentInData). No separate role list to keep in sync. */
  data: TData;
  title?: string;
  description?: string;
  archived?: boolean;
  onEdit?: () => void;
  onArchive?: () => void;
  onRestore?: () => void;
}

export function ConfigurableDetail<TData extends Record<string, unknown>>({
  fields,
  data,
  title,
  description,
  archived = false,
  onEdit,
  onArchive,
  onRestore,
}: ConfigurableDetailProps<TData>) {
  const visibleFields = fieldsPresentInData(fields, data);

  const actions =
    onEdit || onArchive || onRestore ? (
      <div className="flex gap-2">
        {onEdit ? (
          <Button size="sm" variant="outline" onClick={onEdit}>
            Edit
          </Button>
        ) : null}
        {archived
          ? onRestore && (
              <Button size="sm" variant="outline" onClick={onRestore}>
                Restore
              </Button>
            )
          : onArchive && (
              <Button size="sm" variant="outline-danger" onClick={onArchive}>
                Archive
              </Button>
            )}
      </div>
    ) : null;

  return (
    <Panel title={title} description={description} action={actions}>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {visibleFields.map((field) => (
          <div
            key={field.key}
            className={field.fullWidth ? "sm:col-span-2" : undefined}
          >
            <dt className="text-xs font-semibold uppercase tracking-wide text-neutral-text">
              {resolveDetailFieldLabel(field)}
            </dt>
            <dd className="mt-1 text-sm text-surface-navy">
              {renderDetailValue(field, data[field.key])}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
