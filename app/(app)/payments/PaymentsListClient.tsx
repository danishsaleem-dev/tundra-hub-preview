"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { UserRole } from "@prisma/client";
import { Panel } from "@/components/Panel";
import { Button } from "@/components/Button";
import { ConfigurableList } from "@/components/ConfigurableList";
import { useToast } from "@/components/ToastProvider";
import { ENTITY_LABELS } from "@/lib/labels";
import {
  PAYMENT_LIST_COLUMNS,
  PAYMENT_LIST_FILTERS,
  PAYMENT_ADMIN_ONLY_ACTIONS,
} from "./payment-config";

interface PaymentRow {
  [key: string]: unknown;
  id: string;
  paymentName: string;
}

const PAGE_SIZE = 10;

export function PaymentsListClient({ realRole }: { realRole: UserRole }) {
  const router = useRouter();
  const { showToast } = useToast();
  const canManage = PAYMENT_ADMIN_ONLY_ACTIONS.includes(realRole);
  const [rows, setRows] = useState<PaymentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filterValues, setFilterValues] = useState<Record<string, string>>({
    status: "",
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
      if (filterValues.status) params.set("status", filterValues.status);

      try {
        const res = await fetch(`/api/payments?${params.toString()}`);
        const body = await res.json().catch(() => null);
        if (cancelled) return;

        if (res.ok && body) {
          setRows(body.payments);
          setTotal(body.total);
        } else {
          showToast(
            "critical",
            body?.error ?? `Couldn't load ${ENTITY_LABELS.payment.plural.toLowerCase()}.`,
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

  async function handleArchive(row: PaymentRow) {
    try {
      const res = await fetch(`/api/payments/${row.id}/archive`, { method: "POST" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        showToast("critical", body?.error ?? "Couldn't archive.");
        return;
      }
      showToast("success", `Archived ${row.paymentName}.`);
      setRefreshKey((key) => key + 1);
    } catch {
      showToast("critical", "Couldn't reach the server.");
    }
  }

  return (
    <Panel
      title={ENTITY_LABELS.payment.plural}
      action={
        canManage ? (
          <Button size="sm" onClick={() => router.push("/payments/new")}>
            Add {ENTITY_LABELS.payment.singular}
          </Button>
        ) : undefined
      }
    >
      {loading && rows.length === 0 ? (
        <p className="text-sm text-neutral-text">Loading…</p>
      ) : (
        <ConfigurableList
          columns={PAYMENT_LIST_COLUMNS}
          filters={PAYMENT_LIST_FILTERS}
          role={realRole}
          rows={rows}
          total={total}
          page={page}
          pageSize={PAGE_SIZE}
          onPageChange={setPage}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onArchive={canManage ? handleArchive : undefined}
          onRowSelect={(row) => router.push(`/payments/${row.id}`)}
          entityLabelPlural={ENTITY_LABELS.payment.plural.toLowerCase()}
        />
      )}
    </Panel>
  );
}
