"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { Panel } from "@/components/Panel";
import { Button } from "@/components/Button";
import { ConfigurableList } from "@/components/ConfigurableList";
import { useToast } from "@/components/ToastProvider";
import { ENTITY_LABELS } from "@/lib/labels";
import { NIL_DEAL_LIST_COLUMNS, NIL_DEAL_LIST_FILTERS } from "./nil-deal-config";

interface NilDealRow {
  [key: string]: unknown;
  id: string;
  dealName: string;
}

const PAGE_SIZE = 10;
const ADMIN_ONLY: UserRole[] = ["ADMIN"];

export function NilDealsListClient({ realRole }: { realRole: UserRole }) {
  const router = useRouter();
  const { showToast } = useToast();
  const canManage = ADMIN_ONLY.includes(realRole);
  const [rows, setRows] = useState<NilDealRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    contractStatus: "",
    dealType: "",
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
      });
      if (filterValues.contractStatus) params.set("contractStatus", filterValues.contractStatus);
      if (filterValues.dealType) params.set("dealType", filterValues.dealType);

      try {
        const res = await fetch(`/api/nil-deals?${params.toString()}`);
        const body = await res.json().catch(() => null);
        if (cancelled) return;

        if (res.ok && body) {
          setRows(body.nilDeals);
          setTotal(body.total);
        } else {
          showToast(
            "critical",
            body?.error ?? `Couldn't load ${ENTITY_LABELS.nilDeal.plural}.`,
          );
        }
      } catch {
        if (!cancelled) showToast("critical", "Couldn't reach the server.");
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

  async function handleArchive(row: NilDealRow) {
    try {
      const res = await fetch(`/api/nil-deals/${row.id}/archive`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showToast("critical", body?.error ?? "Couldn't archive.");
        return;
      }
      showToast("success", `Archived ${row.dealName}.`);
      setRefreshKey((key) => key + 1);
    } catch {
      showToast("critical", "Couldn't reach the server.");
    }
  }

  return (
    <Panel
      title={ENTITY_LABELS.nilDeal.plural}
      action={
        canManage ? (
          <Button size="sm" onClick={() => router.push("/nil-deals/new")}>
            Add {ENTITY_LABELS.nilDeal.singular}
          </Button>
        ) : undefined
      }
    >
      {loading && rows.length === 0 ? (
        <p className="text-sm text-neutral-text">Loading…</p>
      ) : (
        <ConfigurableList
          columns={NIL_DEAL_LIST_COLUMNS}
          filters={NIL_DEAL_LIST_FILTERS}
          role={realRole}
          rows={rows}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onArchive={canManage ? handleArchive : undefined}
          onRowSelect={(row) => router.push(`/nil-deals/${row.id}`)}
          entityLabelPlural={ENTITY_LABELS.nilDeal.plural}
        />
      )}
    </Panel>
  );
}
