import { Sparkles } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { Panel } from "@/components/Panel";
import { StatusChip } from "@/components/StatusChip";
import { ListRow } from "@/components/ListRow";
import type { StatusVariant } from "@/lib/status";

interface DealRow {
  brand: string;
  ends: string;
  amount: string;
  paid: string;
  due: string;
  status: StatusVariant;
  statusLabel: string;
}

const DEALS: DealRow[] = [
  {
    brand: "Velocity Apparel",
    ends: "Ends 2026-08-31",
    amount: "$18,000",
    paid: "$9,000",
    due: "$9,000",
    status: "success",
    statusLabel: "Active",
  },
  {
    brand: "Champion's Table Restaurant",
    ends: "Ends 2026-12-31",
    amount: "$10,500",
    paid: "$3,500",
    due: "$7,000",
    status: "success",
    statusLabel: "Active",
  },
];

interface ComplianceRow {
  label: string;
  due: string;
  status: StatusVariant;
  statusLabel: string;
}

const COMPLIANCE: ComplianceRow[] = [
  {
    label: "NIL Activity Disclosure – Velocity Apparel",
    due: "Due 2025-09-10",
    status: "success",
    statusLabel: "Submitted",
  },
  {
    label: "1099 Filing – Caleb Fontaine",
    due: "Due 2027-01-31",
    status: "neutral",
    statusLabel: "Pending",
  },
];

const QUICK_ACTIONS = ["What do I owe?", "Deal timeline", "My documents"];

export function AthleteDashboardContent() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 rounded-xl bg-gradient-to-r from-surface-navy to-brand-blue px-6 py-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold text-white">
            CF
          </span>
          <div>
            <p className="text-base font-bold text-white">Caleb Fontaine</p>
            <p className="text-xs text-slate-300">
              QB · University of Georgia · Junior
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-300">
            Total NIL Earnings
          </p>
          <p className="text-2xl font-bold text-white">$28,500</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          accent="brand"
          label="Active Deals"
          value="2"
          subtext="All active"
        />
        <KpiCard
          accent="success"
          label="Payments Received"
          value="$8,000"
          subtext="This season"
        />
        <KpiCard
          accent="brand"
          label="Upcoming Payment"
          value="$8,000"
          subtext="In pipeline"
        />
        <KpiCard
          accent="warning"
          label="Compliance Items"
          value="2"
          subtext="1 pending"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="My NIL Deals">
          <ul className="divide-y divide-card-tint">
            {DEALS.map((deal) => (
              <li key={deal.brand} className="py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-[#0B1330]">
                      {deal.brand}
                    </p>
                    <p className="text-xs text-neutral-text">{deal.ends}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-[#0B1330]">
                      {deal.amount}
                    </span>
                    <StatusChip
                      variant={deal.status}
                      label={deal.statusLabel}
                    />
                  </div>
                </div>
                <p className="mt-1.5 text-xs">
                  <span className="font-medium text-success-text">
                    Paid: {deal.paid}
                  </span>{" "}
                  <span className="font-medium text-warning-text">
                    Due: {deal.due}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Tundra Assistant" icon={Sparkles} tone="dark">
          <p className="text-xs leading-relaxed text-slate-300">
            Your Q2 Velocity payment of $4,500 is overdue. Your agent has
            been notified and is following up with the brand. No action
            required from you.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action}
                type="button"
                className="rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 transition-colors hover:bg-white/15"
              >
                {action}
              </button>
            ))}
          </div>
          <p className="mt-3 border-t border-white/10 pt-2.5 text-[11px] text-slate-500">
            MOCK AI ASSISTANT · Not a real integration
          </p>
        </Panel>
      </div>

      <Panel title="Compliance">
        <ul className="divide-y divide-card-tint">
          {COMPLIANCE.map((item) => (
            <ListRow
              key={item.label}
              title={item.label}
              meta={item.due}
              trailing={
                <StatusChip variant={item.status} label={item.statusLabel} />
              }
            />
          ))}
        </ul>
      </Panel>
    </div>
  );
}
