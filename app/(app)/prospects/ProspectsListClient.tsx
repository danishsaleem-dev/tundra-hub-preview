"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { AlertTriangle } from "lucide-react";
import { Panel } from "@/components/Panel";
import { Button } from "@/components/Button";
import { ConfigurableList } from "@/components/ConfigurableList";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/ToastProvider";
import { ENTITY_LABELS } from "@/lib/labels";
import {
  PROSPECT_LIST_COLUMNS,
  PROSPECT_LIST_FILTERS,
  PROSPECT_ADMIN_ONLY_ACTIONS,
} from "./prospect-config";

interface ProspectRow {
  [key: string]: unknown;
  id: string;
  fullName: string;
}

const PAGE_SIZE = 10;

export function ProspectsListClient({ realRole }: { realRole: UserRole }) {
  const router = useRouter();
  const { showToast } = useToast();
  const canManage = PROSPECT_ADMIN_ONLY_ACTIONS.includes(realRole);
  const [rows, setRows] = useState<ProspectRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: "",
    priorityTier: "",
  });
  const [loading, setLoading] = useState(true);
  // Distinct from "rows is empty" — rows starts empty and stays empty on a
  // failed fetch too, so without this the page would render the exact same
  // "No prospects found" empty state whether the list is genuinely empty or
  // the request just failed, with only a toast (gone after 4s) telling them
  // apart. loadError makes that a real, durable render state instead.
  const [loadError, setLoadError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (filterValues.status) params.set("status", filterValues.status);
      if (filterValues.priorityTier) params.set("priorityTier", filterValues.priorityTier);

      setLoadError(false);

      try {
        const res = await fetch(`/api/prospects?${params.toString()}`);
        const body = await res.json().catch(() => null);
        if (cancelled) return;

        if (res.ok && body) {
          setRows(body.prospects);
          setTotal(body.total);
        } else {
          setLoadError(true);
          showToast(
            "critical",
            body?.error ?? `Couldn't load ${ENTITY_LABELS.prospect.plural.toLowerCase()}.`,
          );
        }
      } catch {
        if (!cancelled) {
          setLoadError(true);
          showToast("critical", "Couldn't reach the server.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [page, filterValues, refreshKey, showToast]);

  function handleFilterChange(key: string, value: string) {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  async function handleArchive(row: ProspectRow) {
    try {
      const res = await fetch(`/api/prospects/${row.id}/archive`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showToast("critical", body?.error ?? "Couldn't archive.");
        return;
      }
      showToast("success", `Archived ${row.fullName}.`);
      setRefreshKey((key) => key + 1);
    } catch {
      showToast("critical", "Couldn't reach the server.");
    }
  }

  return (
    <Panel
      title={ENTITY_LABELS.prospect.plural}
      action={
        canManage ? (
          <Button size="sm" onClick={() => router.push("/prospects/new")}>
            Add {ENTITY_LABELS.prospect.singular}
          </Button>
        ) : undefined
      }
    >
      {loading && rows.length === 0 ? (
        <p className="text-sm text-neutral-text">Loading…</p>
      ) : loadError ? (
        <EmptyState
          icon={AlertTriangle}
          title={`Couldn't load ${ENTITY_LABELS.prospect.plural.toLowerCase()}`}
          description="Something went wrong loading this list. The toast above has the real reason — try again."
          action={
            <Button size="sm" variant="outline" onClick={() => setRefreshKey((key) => key + 1)}>
              Retry
            </Button>
          }
        />
      ) : (
        <ConfigurableList
          columns={PROSPECT_LIST_COLUMNS}
          filters={PROSPECT_LIST_FILTERS}
          role={realRole}
          rows={rows}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onArchive={canManage ? handleArchive : undefined}
          onRowSelect={(row) => router.push(`/prospects/${row.id}`)}
          entityLabelPlural={ENTITY_LABELS.prospect.plural.toLowerCase()}
        />
      )}
    </Panel>
  );
}
