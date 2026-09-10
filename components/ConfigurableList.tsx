"use client";

import type { ReactNode } from "react";
import type { UserRole } from "@prisma/client";
import { Inbox } from "lucide-react";
import { DataTable, type Column } from "@/components/DataTable";
import { StatusChip } from "@/components/StatusChip";
import { SelectField } from "@/components/SelectField";
import { SearchInput } from "@/components/SearchInput";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { formatCurrency } from "@/lib/format";
import {
  columnsForRole,
  filtersForRole,
  resolveColumnLabel,
  resolveFilterLabel,
  type ListColumnConfig,
  type ListFilterConfig,
} from "@/lib/list-config";

function renderCellValue(column: ListColumnConfig, value: unknown): ReactNode {
  if (value === null || value === undefined || value === "") {
    return column.type === "boolean" ? "No" : "—";
  }

  switch (column.type) {
    case "currency":
      return formatCurrency(value as string | number);
    case "boolean":
      return value ? "Yes" : "No";
    case "date": {
      const date = new Date(value as string);
      return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString();
    }
    case "status": {
      const option = column.statusMap?.[String(value)];
      return (
        <StatusChip
          variant={option?.variant ?? "neutral"}
          label={option?.label ?? String(value)}
        />
      );
    }
    case "number":
    case "text":
    default:
      return String(value);
  }
}

export interface ConfigurableListProps<TRow extends Record<string, unknown>> {
  columns: ListColumnConfig[];
  filters?: ListFilterConfig[];
  /** The real signed-in caller's role — only columns/filters this role is
   * allowed to see are ever rendered. */
  role: UserRole;
  rows: TRow[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onArchive?: (row: TRow) => void;
  onRowSelect?: (row: TRow) => void;
  entityLabelPlural?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ConfigurableList<TRow extends Record<string, unknown>>({
  columns,
  filters = [],
  role,
  rows,
  total,
  page,
  pageSize,
  onPageChange,
  filterValues,
  onFilterChange,
  onArchive,
  onRowSelect,
  entityLabelPlural = "records",
  emptyTitle,
  emptyDescription,
}: ConfigurableListProps<TRow>) {
  const visibleColumns = columnsForRole(columns, role);
  const visibleFilters = filtersForRole(filters, role);
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const tableColumns: Column<TRow>[] = visibleColumns.map((column) => ({
    key: column.key,
    header: resolveColumnLabel(column),
    align: column.align,
    render: (row) => renderCellValue(column, row[column.key]),
  }));

  if (onRowSelect || onArchive) {
    tableColumns.push({
      key: "__actions",
      header: "",
      align: "right",
      render: (row) => (
        <div className="flex justify-end gap-2">
          {onRowSelect ? (
            <Button size="sm" variant="outline" onClick={() => onRowSelect(row)}>
              View
            </Button>
          ) : null}
          {onArchive ? (
            <Button
              size="sm"
              variant="outline-danger"
              onClick={() => onArchive(row)}
            >
              Archive
            </Button>
          ) : null}
        </div>
      ),
    });
  }

  return (
    <div className="space-y-4">
      {visibleFilters.length > 0 ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          {visibleFilters.map((filter) =>
            filter.type === "select" ? (
              <SelectField
                key={filter.key}
                label={resolveFilterLabel(filter)}
                options={[{ value: "", label: "All" }, ...(filter.options ?? [])]}
                value={filterValues[filter.key] ?? ""}
                onChange={(value) => onFilterChange(filter.key, value)}
                containerClassName="sm:w-48"
              />
            ) : (
              <div key={filter.key} className="space-y-1.5 sm:w-64">
                <p className="text-sm font-semibold text-surface-navy">
                  {resolveFilterLabel(filter)}
                </p>
                <SearchInput
                  value={filterValues[filter.key] ?? ""}
                  onChange={(e) => onFilterChange(filter.key, e.target.value)}
                  placeholder={`Search ${resolveFilterLabel(filter).toLowerCase()}…`}
                />
              </div>
            ),
          )}
        </div>
      ) : null}

      {rows.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={emptyTitle ?? `No ${entityLabelPlural} found`}
          description={emptyDescription}
        />
      ) : (
        <>
          <DataTable
            columns={tableColumns}
            rows={rows}
            rowKey={(row) => String(row.id)}
          />
          <Pagination
            page={page}
            pageCount={pageCount}
            onPageChange={onPageChange}
            totalLabel={`${total} ${entityLabelPlural}`}
          />
        </>
      )}
    </div>
  );
}
