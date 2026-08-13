import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AlertBanner } from "@/components/AlertBanner";
import { KpiCard } from "@/components/KpiCard";
import { Panel } from "@/components/Panel";
import { StatusChip } from "@/components/StatusChip";
import type { StatusVariant } from "@/lib/status";

export const metadata: Metadata = {
  title: "Dashboard — Tundra Sports Hub",
};

interface PaymentRow {
  label: string;
  brand: string;
  amount: string;
  status: StatusVariant;
  statusLabel: string;
}

const PAYMENTS: PaymentRow[] = [
  {
    label: "Velocity Apparel – Q1 Payment",
    brand: "Velocity Apparel · Caleb Fontaine",
    amount: "$4,500",
    status: "success",
    statusLabel: "Paid",
  },
  {
    label: "Velocity Apparel – Q2 Payment",
    brand: "Velocity Apparel · Caleb Fontaine",
    amount: "$4,500",
    status: "critical",
    statusLabel: "Overdue",
  },
  {
    label: "Glacier Energy – April Installment",
    brand: "Glacier Energy Drinks · Marcus Bellamy",
    amount: "$8,000",
    status: "critical",
    statusLabel: "Overdue",
  },
  {
    label: "Champion's Table – Q1 Payment",
    brand: "Champion's Table Restaurant · Caleb Fontaine",
    amount: "$3,500",
    status: "success",
    statusLabel: "Paid",
  },
  {
    label: "ProEdge Training – Kickoff Payment",
    brand: "ProEdge Training Center · Trevon Garris",
    amount: "$6,500",
    status: "neutral",
    statusLabel: "Pending",
  },
  {
    label: "Champion's Table – Q2 Payment",
    brand: "Champion's Table Restaurant · Caleb Fontaine",
    amount: "$3,500",
    status: "warning",
    statusLabel: "Due Soon",
  },
];

interface TaskRow {
  title: string;
  priority: StatusVariant;
  priorityLabel: string;
  owner: string;
  due: string;
  overdue?: boolean;
}

const TASKS: TaskRow[] = [
  {
    title: "Follow up with Velocity Apparel on overdue Q2 payment",
    priority: "critical",
    priorityLabel: "Critical",
    owner: "Marcus Webb",
    due: "Overdue",
    overdue: true,
  },
  {
    title: "Collect Glacier Energy overdue April payment",
    priority: "critical",
    priorityLabel: "Critical",
    owner: "Darnell Okafor",
    due: "Overdue",
    overdue: true,
  },
  {
    title: "Get disclosure form from Trevon Garris (ProEdge deal)",
    priority: "warning",
    priorityLabel: "High",
    owner: "Jordan Pierce",
    due: "Due 2026-05-22",
  },
  {
    title: "Send ProEdge contract to Trevon Garris for signature",
    priority: "warning",
    priorityLabel: "High",
    owner: "Jordan Pierce",
    due: "Due 2026-05-23",
  },
  {
    title: "Review representation agreement draft for DeShawn Tillery",
    priority: "warning",
    priorityLabel: "High",
    owner: "Jordan Pierce",
    due: "Due 2026-05-25",
  },
];

export default function DashboardPage() {
  return (
    <AppShell title="Dashboard" defaultRole="admin">
      <div className="space-y-6">
        <div className="space-y-3">
          <AlertBanner
            variant="critical"
            message={
              <>
                <span className="font-semibold">Overdue Payment:</span>{" "}
                Velocity Apparel – Q2 Payment — $4,500 outstanding · 34 days
                since invoice
              </>
            }
            action={
              <span className="text-xs font-bold text-critical-text">
                ACTION REQUIRED
              </span>
            }
          />
          <AlertBanner
            variant="critical"
            message={
              <>
                <span className="font-semibold">Overdue Payment:</span>{" "}
                Glacier Energy – April Installment — $8,000 outstanding · 48
                days since invoice
              </>
            }
            action={
              <span className="text-xs font-bold text-critical-text">
                ACTION REQUIRED
              </span>
            }
          />
          <AlertBanner
            variant="warning"
            message={
              <>
                <span className="font-semibold">Compliance Overdue:</span>{" "}
                NIL Activity Disclosure – ProEdge Training — Trevon Garris ·
                Deal on hold
              </>
            }
            action={
              <span className="text-xs font-bold text-warning-text">
                ACTION REQUIRED
              </span>
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            accent="brand"
            label="Active Athletes"
            value="5"
            subtext="↑ 2 added this quarter"
          />
          <KpiCard
            accent="brand"
            label="Active NIL Deals"
            value="4"
            subtext="5 total deals tracked"
          />
          <KpiCard
            accent="critical"
            label="Outstanding Receivables"
            value="$22,500"
            subtext="2 invoices overdue"
          />
          <KpiCard
            accent="success"
            label="Total Collected"
            value="$8,000"
            subtext="Lifetime payments received"
          />
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Panel title="Payment Health" className="lg:col-span-1">
            <ul className="divide-y divide-card-tint">
              {PAYMENTS.map((payment) => (
                <li
                  key={payment.label}
                  className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#0B1330]">
                      {payment.label}
                    </p>
                    <p className="truncate text-xs text-neutral-text">
                      {payment.brand}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-sm font-semibold text-[#0B1330]">
                      {payment.amount}
                    </span>
                    <StatusChip
                      variant={payment.status}
                      label={payment.statusLabel}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Priority Actions" className="lg:col-span-1">
            <ul className="divide-y divide-card-tint">
              {TASKS.map((task) => (
                <li
                  key={task.title}
                  className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0"
                >
                  <span
                    className={
                      task.priority === "critical"
                        ? "mt-1 h-full w-1 shrink-0 self-stretch rounded-full bg-critical-text"
                        : "mt-1 h-full w-1 shrink-0 self-stretch rounded-full bg-warning-text"
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#0B1330]">
                      {task.title}
                    </p>
                    <p className="mt-1 text-xs text-neutral-text">
                      → {task.owner}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusChip
                      variant={task.priority}
                      label={task.priorityLabel}
                    />
                    <span
                      className={
                        task.overdue
                          ? "text-xs font-medium text-critical-text"
                          : "text-xs text-neutral-text"
                      }
                    >
                      {task.due}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="AI Executive Briefing"
            icon={Sparkles}
            tone="dark"
            className="lg:col-span-1"
          >
            <div className="space-y-3 text-sm leading-relaxed text-slate-300">
              <p>
                <span className="font-semibold text-white">
                  Revenue Risk:
                </span>{" "}
                Two overdue payments totaling{" "}
                <span className="font-semibold text-critical-text">
                  $12,500
                </span>{" "}
                require immediate follow-up. Glacier Energy is 48 days past
                invoice — escalation recommended.
              </p>
              <p>
                <span className="font-semibold text-white">
                  Compliance Hold:
                </span>{" "}
                Trevon Garris&apos;s ProEdge deal is blocked pending
                disclosure form. Risk to $6,500 in contract value if not
                cleared before May 25 deadline.
              </p>
              <p>
                <span className="font-semibold text-white">Pipeline:</span>{" "}
                Quinton Hargrove (#4 national safety) and Isaiah Drummond
                (#12 national QB) are in final stages. Close both this week
                to hit monthly signing target.
              </p>
            </div>
            <p className="mt-4 border-t border-white/10 pt-3 text-xs text-slate-500">
              MOCK AI OUTPUT · Tundra Intelligence v1 · Updated May 19, 2026
            </p>
          </Panel>
        </div>
      </div>
    </AppShell>
  );
}
