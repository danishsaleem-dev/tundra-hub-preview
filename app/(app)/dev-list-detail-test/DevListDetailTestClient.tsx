"use client";

import { useEffect, useMemo, useState } from "react";
import type { UserRole } from "@prisma/client";
import { Panel } from "@/components/Panel";
import { Button } from "@/components/Button";
import { ConfigurableList } from "@/components/ConfigurableList";
import { ConfigurableDetail } from "@/components/ConfigurableDetail";
import { ConfigurableForm } from "@/components/ConfigurableForm";
import { useToast } from "@/components/ToastProvider";
import type { ListColumnConfig, ListFilterConfig } from "@/lib/list-config";
import type { DetailFieldConfig } from "@/lib/detail-config";
import type { FormFieldConfig } from "@/lib/form-config";

interface TestRow {
  // Structural index signature so TestRow satisfies the generic
  // Record<string, unknown> constraint ConfigurableList/ConfigurableDetail
  // use — every field below is still concretely typed, this doesn't
  // loosen them.
  [key: string]: unknown;
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  notes: string;
  active: boolean;
  status: "DRAFT" | "ACTIVE" | "DONE";
  internalScore: number;
  archived: boolean;
}

const STATUS_OPTIONS = [
  { value: "DRAFT", label: "Draft" },
  { value: "ACTIVE", label: "Active" },
  { value: "DONE", label: "Done" },
];

const STATUS_MAP = {
  DRAFT: { variant: "neutral" as const, label: "Draft" },
  ACTIVE: { variant: "success" as const, label: "Active" },
  DONE: { variant: "warning" as const, label: "Done" },
};

// Representative mix of column types the shared list must support, plus
// one ADMIN-only column (internalScore) proving structural exclusion the
// same way Day 1's form harness proved it for form fields.
const LIST_COLUMNS: ListColumnConfig[] = [
  { key: "name", type: "text" },
  { key: "amount", type: "currency" },
  { key: "dueDate", type: "date" },
  { key: "status", type: "status", statusMap: STATUS_MAP },
  { key: "active", type: "boolean" },
  { key: "internalScore", type: "number", roles: ["ADMIN"] },
];

const LIST_FILTERS: ListFilterConfig[] = [
  { key: "status", type: "select", options: STATUS_OPTIONS },
  { key: "name", type: "text" },
];

const DETAIL_FIELDS: DetailFieldConfig[] = [
  { key: "name", type: "text" },
  { key: "amount", type: "currency" },
  { key: "dueDate", type: "date" },
  { key: "status", type: "status", statusMap: STATUS_MAP },
  { key: "active", type: "boolean" },
  { key: "internalScore", type: "number" },
  { key: "notes", type: "textarea", fullWidth: true },
];

const FORM_FIELDS: FormFieldConfig[] = [
  { name: "name", type: "text", required: true },
  { name: "amount", type: "number" },
  { name: "dueDate", type: "date" },
  { name: "notes", type: "textarea" },
  { name: "active", type: "boolean" },
  { name: "status", type: "select", options: STATUS_OPTIONS },
  { name: "internalScore", type: "number", roles: ["ADMIN"] },
];

function generateRows(): TestRow[] {
  const statuses: TestRow["status"][] = ["DRAFT", "ACTIVE", "DONE"];
  return Array.from({ length: 23 }, (_, i) => ({
    id: `row-${i + 1}`,
    name: `Test Record ${i + 1}`,
    amount: 100 + i * 37,
    dueDate: new Date(2026, 8, 1 + i).toISOString().slice(0, 10),
    notes: `Notes for record ${i + 1}.`,
    active: i % 3 !== 0,
    status: statuses[i % statuses.length],
    internalScore: 50 + i,
    archived: false,
  }));
}

const PAGE_SIZE = 10;

type ViewMode = "list" | "detail" | "edit";

export function DevListDetailTestClient({ realRole }: { realRole: UserRole }) {
  const { showToast } = useToast();
  const [rows, setRows] = useState<TestRow[]>(generateRows);
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: "",
    name: "",
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mode, setMode] = useState<ViewMode>("list");

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filterValues.status && row.status !== filterValues.status) return false;
      if (
        filterValues.name &&
        !row.name.toLowerCase().includes(filterValues.name.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [rows, filterValues]);

  const pageRows = filteredRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const selectedRow = rows.find((r) => r.id === selectedId) ?? null;

  // ConfigurableDetail deliberately does no role filtering of its own —
  // it renders whatever keys are on the object it's handed, trusting
  // that object to already be role-scoped (that's the whole point: it
  // must reflect real API shaping, not a second permission list). A real
  // module's detail page gets that scoping for free from its API route
  // (NON_ADMIN_ATHLETE_SELECT-style). This harness has no such route for
  // its synthetic rows, so it has to do the same scoping by hand here —
  // omitting internalScore is what stands in for "the API never sent
  // this key" in the local list -> detail flow specifically. The
  // separate Role-Scoped Detail Data Proof panel below proves the real
  // API-driven version of this same guarantee.
  const detailData =
    selectedRow && realRole !== "ADMIN"
      ? (() => {
          const { internalScore: _internalScore, ...rest } = selectedRow;
          return rest;
        })()
      : selectedRow;

  function handleFilterChange(key: string, value: string) {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function handleArchive(row: TestRow) {
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, archived: !r.archived } : r)),
    );
    showToast(
      "success",
      row.archived ? `Restored ${row.name}.` : `Archived ${row.name}.`,
    );
  }

  function handleFormSubmit(values: Record<string, unknown>) {
    if (!selectedId) return;
    setRows((prev) =>
      prev.map((r) =>
        r.id === selectedId
          ? {
              ...r,
              name: String(values.name ?? r.name),
              amount: values.amount === "" ? r.amount : Number(values.amount),
              dueDate: String(values.dueDate || r.dueDate),
              notes: String(values.notes ?? r.notes),
              active: Boolean(values.active),
              status: (values.status || r.status) as TestRow["status"],
              internalScore:
                values.internalScore === "" || values.internalScore === undefined
                  ? r.internalScore
                  : Number(values.internalScore),
            }
          : r,
      ),
    );
    showToast("success", "Record updated.");
    setMode("detail");
  }

  // --- Role-scoped detail-view proof: real fetch, real API-side field
  // omission (see GET /api/dev-form-test), not simulated client-side. ---
  const [apiRecord, setApiRecord] = useState<Record<string, unknown> | null>(null);
  const [apiLoading, setApiLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dev-form-test");
        const body = await res.json().catch(() => null);
        if (!cancelled && res.ok && body) setApiRecord(body.record);
      } finally {
        if (!cancelled) setApiLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-4">
      <Panel
        title="List / Detail / Edit Harness"
        description={`Signed in as ${realRole} — internalScore is an ADMIN-only column/field throughout this whole flow. All data on this panel is local, in-memory test data, not a real module.`}
      >
        {mode === "list" ? (
          <ConfigurableList
            columns={LIST_COLUMNS}
            filters={LIST_FILTERS}
            role={realRole}
            rows={pageRows}
            total={filteredRows.length}
            page={page}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
            onArchive={handleArchive}
            onRowSelect={(row) => {
              setSelectedId(row.id);
              setMode("detail");
            }}
            entityLabelPlural="test records"
          />
        ) : null}

        {mode === "detail" && selectedRow ? (
          <div className="space-y-3">
            <Button size="sm" variant="ghost" onClick={() => setMode("list")}>
              ← Back to list
            </Button>
            <ConfigurableDetail
              fields={DETAIL_FIELDS}
              data={detailData ?? selectedRow}
              title={selectedRow.name}
              archived={selectedRow.archived}
              onEdit={() => setMode("edit")}
              onArchive={() => handleArchive(selectedRow)}
              onRestore={() => handleArchive(selectedRow)}
            />
          </div>
        ) : null}

        {mode === "edit" && selectedRow ? (
          <div className="space-y-3">
            <Button size="sm" variant="ghost" onClick={() => setMode("detail")}>
              ← Back to detail
            </Button>
            <ConfigurableForm
              fields={FORM_FIELDS}
              role={realRole}
              initialValues={selectedRow}
              onSubmit={handleFormSubmit}
              onCancel={() => setMode("detail")}
              submitLabel="Save Changes"
            />
          </div>
        ) : null}
      </Panel>

      <Panel
        title="Role-Scoped Detail Data Proof"
        description="Fetched live from GET /api/dev-form-test — internalNotes is only ever in the response body for ADMIN. This panel proves the detail view renders exactly what the API sent, nothing filtered client-side."
      >
        {apiLoading ? (
          <p className="text-sm text-neutral-text">Loading…</p>
        ) : apiRecord ? (
          <ConfigurableDetail
            fields={[
              { key: "name", type: "text" },
              { key: "amount", type: "currency" },
              { key: "status", type: "status", statusMap: STATUS_MAP },
              { key: "internalNotes", type: "textarea", fullWidth: true },
            ]}
            data={apiRecord}
          />
        ) : (
          <p className="text-sm text-critical-text">Couldn&apos;t load the record.</p>
        )}
      </Panel>
    </div>
  );
}
