import { Sparkles } from "lucide-react";
import { AlertBanner } from "@/components/AlertBanner";
import { KpiCard } from "@/components/KpiCard";
import { Panel } from "@/components/Panel";
import { StatusChip } from "@/components/StatusChip";
import { ListRow, type ListRowTag } from "@/components/ListRow";
import { ActivityItem } from "@/components/ActivityItem";
import type { StatusVariant } from "@/lib/status";

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

interface DealHealthRow {
  title: string;
  meta: string;
  status: StatusVariant;
  statusLabel: string;
  tags?: ListRowTag[];
}

const DEAL_HEALTH: DealHealthRow[] = [
  {
    title: "Velocity Apparel – Caleb Fontaine",
    meta: "$18,000 · Ends 2026-08-31",
    status: "success",
    statusLabel: "Active",
  },
  {
    title: "Glacier Energy – Marcus Bellamy",
    meta: "$24,000 · Ends 2026-10-14",
    status: "success",
    statusLabel: "Active",
    tags: [{ variant: "warning", label: "Payment overdue 21 days" }],
  },
  {
    title: "Champion's Table – Caleb Fontaine",
    meta: "$10,500 · Ends 2026-12-31",
    status: "success",
    statusLabel: "Active",
  },
  {
    title: "ProEdge Training – Trevon Garris",
    meta: "$6,500 · Ends 2026-11-30",
    status: "warning",
    statusLabel: "Pre-Launch",
    tags: [
      { variant: "warning", label: "Compliance hold – disclosure pending" },
      { variant: "warning", label: "Contract unsigned" },
    ],
  },
  {
    title: "SouthGrid Auto – Jaylon Prescott",
    meta: "$15,000 · Ends 2026-10-31",
    status: "success",
    statusLabel: "Active",
  },
];

interface ComplianceRow {
  title: string;
  meta: string;
  status: StatusVariant;
  statusLabel: string;
}

const COMPLIANCE: ComplianceRow[] = [
  {
    title: "NIL Activity Disclosure – Velocity Apparel",
    meta: "Caleb Fontaine · Due 2025-09-10",
    status: "success",
    statusLabel: "Submitted",
  },
  {
    title: "Representation Agreement – DeShawn Tillery",
    meta: "Due 2026-05-25",
    status: "warning",
    statusLabel: "Pending Review",
  },
  {
    title: "W-9 – Marcus Bellamy",
    meta: "Due 2026-01-15",
    status: "success",
    statusLabel: "Complete",
  },
  {
    title: "NIL Activity Disclosure – ProEdge Training",
    meta: "Trevon Garris · Due 2026-05-10",
    status: "critical",
    statusLabel: "Overdue",
  },
  {
    title: "Eligibility Certification – Jaylon Prescott",
    meta: "Due 2026-08-01",
    status: "success",
    statusLabel: "Complete",
  },
  {
    title: "1099 Filing – Caleb Fontaine",
    meta: "Due 2027-01-31",
    status: "neutral",
    statusLabel: "Pending",
  },
];

interface ActivityRow {
  title: string;
  meta: string;
  dotColor: string;
}

const ACTIVITY: ActivityRow[] = [
  {
    title: "Sent payment reminder to Velocity Apparel for pay2",
    meta: "Marcus Webb · 85d ago",
    dotColor: "bg-brand-blue",
  },
  {
    title: "Logged contact with Quinton Hargrove family (phone call)",
    meta: "Aaliyah Simmons · 85d ago",
    dotColor: "bg-violet-500",
  },
  {
    title: "Updated Glacier Energy deal stage – escalated to brand director",
    meta: "Darnell Okafor · 86d ago",
    dotColor: "bg-brand-blue",
  },
  {
    title: "Uploaded draft contract for Trevon Garris (ProEdge deal)",
    meta: "Jordan Pierce · 86d ago",
    dotColor: "bg-surface-navy",
  },
  {
    title: "Signed Caleb Fontaine (re-enrollment for 2026 season)",
    meta: "Marcus Webb · 87d ago",
    dotColor: "bg-success-text",
  },
  {
    title: "Intro meeting scheduled with Brendan Faulkner and family",
    meta: "Tyrese Harmon · 88d ago",
    dotColor: "bg-violet-500",
  },
  {
    title: "Champion's Table Q2 invoice generated and sent",
    meta: "Darnell Okafor · 89d ago",
    dotColor: "bg-brand-blue",
  },
  {
    title: "System compliance review flagged Trevon Garris disclosure overdue",
    meta: "Admin · 91d ago",
    dotColor: "bg-warning-text",
  },
];

export function AdminDashboardContent() {
  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
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
              <span className="font-semibold">Compliance Overdue:</span> NIL
              Activity Disclosure – ProEdge Training — Trevon Garris · Deal
              on hold
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

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Payment Health">
          <ul className="divide-y divide-card-tint">
            {PAYMENTS.map((payment) => (
              <ListRow
                key={payment.label}
                title={payment.label}
                meta={payment.brand}
                trailing={
                  <>
                    <span className="text-sm font-semibold text-[#0B1330]">
                      {payment.amount}
                    </span>
                    <StatusChip
                      variant={payment.status}
                      label={payment.statusLabel}
                    />
                  </>
                }
              />
            ))}
          </ul>
        </Panel>

        <Panel title="Priority Actions">
          <ul className="divide-y divide-card-tint">
            {TASKS.map((task) => (
              <ListRow
                key={task.title}
                title={task.title}
                meta={`→ ${task.owner}`}
                accent={task.priority}
                trailing={
                  <>
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
                  </>
                }
              />
            ))}
          </ul>
        </Panel>

        <Panel title="AI Executive Briefing" icon={Sparkles} tone="dark">
          <div className="space-y-2.5 text-xs leading-relaxed text-slate-300">
            <p>
              <span className="font-semibold text-white">Revenue Risk:</span>{" "}
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
              Trevon Garris&apos;s ProEdge deal is blocked pending disclosure
              form. Risk to $6,500 if not cleared before May 25.
            </p>
            <p>
              <span className="font-semibold text-white">Pipeline:</span>{" "}
              Quinton Hargrove (#4 national safety) and Isaiah Drummond (#12
              national QB) are in final stages. Close both this week.
            </p>
          </div>
          <p className="mt-3 border-t border-white/10 pt-2.5 text-[11px] text-slate-500">
            MOCK AI OUTPUT · Tundra Intelligence v1 · Updated May 19, 2026
          </p>
        </Panel>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Deal Health">
          <ul className="divide-y divide-card-tint">
            {DEAL_HEALTH.map((deal) => (
              <ListRow
                key={deal.title}
                title={deal.title}
                meta={deal.meta}
                tags={deal.tags}
                trailing={
                  <StatusChip
                    variant={deal.status}
                    label={deal.statusLabel}
                  />
                }
              />
            ))}
          </ul>
        </Panel>

        <Panel title="Compliance Status">
          <ul className="divide-y divide-card-tint">
            {COMPLIANCE.map((item) => (
              <ListRow
                key={item.title}
                title={item.title}
                meta={item.meta}
                trailing={
                  <StatusChip
                    variant={item.status}
                    label={item.statusLabel}
                  />
                }
              />
            ))}
          </ul>
        </Panel>

        <Panel title="Recent Activity">
          <ul className="max-h-80 divide-y divide-card-tint overflow-y-auto">
            {ACTIVITY.map((item) => (
              <ActivityItem
                key={item.title}
                title={item.title}
                meta={item.meta}
                dotColor={item.dotColor}
              />
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
