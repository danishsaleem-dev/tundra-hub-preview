import { Sparkles } from "lucide-react";
import { AlertBanner } from "@/components/AlertBanner";
import { KpiCard } from "@/components/KpiCard";
import { Panel } from "@/components/Panel";
import { StatusChip } from "@/components/StatusChip";
import { ListRow } from "@/components/ListRow";
import { ActivityItem } from "@/components/ActivityItem";
import type { StatusVariant } from "@/lib/status";
import type { DashboardSummary } from "@/lib/dashboard-summary";
import type { ActivityItem as ActivityFeedItem } from "@/lib/activity-feed";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { ENTITY_LABELS } from "@/lib/labels";

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

const DEAL_STATUS_LABEL: Record<string, string> = {
  DRAFTING: "Drafting",
  SENT: "Sent",
  SIGNED: "Signed (Active)",
  COMPLETED: "Completed",
};

const DEAL_STATUS_VARIANT: Record<string, StatusVariant> = {
  DRAFTING: "neutral",
  SENT: "warning",
  SIGNED: "success",
  COMPLETED: "neutral",
};

const ACTIVITY_DOT_COLOR: Record<ActivityFeedItem["type"], string> = {
  ATHLETE_CREATED: "bg-brand-blue",
  PROSPECT_CREATED: "bg-violet-500",
  DEAL_CREATED: "bg-brand-blue",
  DEAL_SIGNED: "bg-success-text",
  PAYMENT_CREATED: "bg-surface-navy",
  PAYMENT_RECEIVED: "bg-success-text",
  RECRUITER_ACTIVATED: "bg-warning-text",
};

// Sentence assembly lives here, not in lib/activity-feed.ts — that file
// hands back structured data (event type + entity name), and this is the
// one place that turns it into display text, using the shared entity
// labels so a label change reaches this feed the same way it reaches
// every other converted display site.
function describeActivity(item: ActivityFeedItem): string {
  switch (item.type) {
    case "ATHLETE_CREATED":
      return `New ${ENTITY_LABELS.athlete.singular} added: ${item.entityName}`;
    case "PROSPECT_CREATED":
      return `New ${ENTITY_LABELS.prospect.singular} added: ${item.entityName}`;
    case "DEAL_CREATED":
      return `New ${ENTITY_LABELS.nilDeal.singular} created: ${item.entityName}`;
    case "DEAL_SIGNED":
      // Deliberately not "just signed" or "recently signed" — see the
      // file-level comment in lib/activity-feed.ts on why that would
      // overstate what updatedAt actually tells us.
      return `${ENTITY_LABELS.nilDeal.singular} signed: ${item.entityName}`;
    case "PAYMENT_CREATED":
      return item.isAutoCreated
        ? `New ${ENTITY_LABELS.payment.singular} auto-created: ${item.entityName}`
        : `New ${ENTITY_LABELS.payment.singular} added: ${item.entityName}`;
    case "PAYMENT_RECEIVED":
      return `${ENTITY_LABELS.payment.singular} received: ${item.entityName}`;
    case "RECRUITER_ACTIVATED":
      return `${ENTITY_LABELS.recruiter.singular} activated: ${item.entityName}`;
  }
}

export interface AdminDashboardContentProps {
  summary: DashboardSummary;
  activity: ActivityFeedItem[];
}

export function AdminDashboardContent({
  summary,
  activity,
}: AdminDashboardContentProps) {
  const totalDealsTracked = Object.values(summary.nilDeals.breakdownByStatus).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <div className="space-y-5">
      <div className="space-y-2.5">
        {summary.payments.overdueCount > 0 ? (
          <AlertBanner
            variant="critical"
            message={
              <>
                <span className="font-semibold">Overdue Payments:</span>{" "}
                {summary.payments.overdueCount} payment
                {summary.payments.overdueCount === 1 ? "" : "s"} totaling{" "}
                {formatCurrency(summary.payments.overdueTotalAmount)}{" "}
                outstanding
              </>
            }
            action={
              <span className="text-xs font-bold text-critical-text">
                ACTION REQUIRED
              </span>
            }
          />
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          accent="brand"
          label={`Active ${ENTITY_LABELS.athlete.plural}`}
          value={String(summary.activeAthleteCount)}
          subtext="Non-archived roster"
        />
        <KpiCard
          accent="brand"
          label={`Active ${ENTITY_LABELS.nilDeal.plural}`}
          value={String(summary.nilDeals.activeCount)}
          subtext={`${totalDealsTracked} total ${ENTITY_LABELS.nilDeal.plural} tracked`}
        />
        <KpiCard
          accent="critical"
          label="Outstanding Receivables"
          value={formatCurrency(summary.payments.totalOutstandingReceivables)}
          subtext={`${summary.payments.overdueCount} invoice${summary.payments.overdueCount === 1 ? "" : "s"} overdue`}
        />
        <KpiCard
          accent="success"
          label="Total Collected"
          value={formatCurrency(summary.payments.totalCollectedLifetime)}
          subtext="Lifetime payments received"
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Panel title="Payment Health">
          <ul className="divide-y divide-card-tint">
            {PAYMENTS.map((payment) => (
              <ListRow
                key={payment.label}
                title={payment.label}
                meta={payment.brand}
                trailing={
                  <>
                    <span className="text-sm font-semibold text-surface-navy">
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

      <div className="grid items-start gap-4 lg:grid-cols-3">
        <Panel
          title={`${ENTITY_LABELS.nilDeal.singular} Overview`}
          description={`${formatCurrency(summary.nilDeals.activeTotalContractValue)} in active (signed) contract value`}
        >
          <ul className="divide-y divide-card-tint">
            {Object.entries(summary.nilDeals.breakdownByStatus).map(
              ([status, count]) => (
                <ListRow
                  key={status}
                  title={DEAL_STATUS_LABEL[status] ?? status}
                  trailing={
                    <>
                      <span className="text-sm font-semibold text-surface-navy">
                        {count}
                      </span>
                      <StatusChip
                        variant={DEAL_STATUS_VARIANT[status] ?? "neutral"}
                        label={
                          count === 1
                            ? ENTITY_LABELS.nilDeal.singular
                            : ENTITY_LABELS.nilDeal.plural
                        }
                      />
                    </>
                  }
                />
              ),
            )}
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
            {activity.length === 0 ? (
              <li className="py-4 text-center text-xs text-neutral-text">
                No recent activity.
              </li>
            ) : (
              activity.map((item) => (
                <ActivityItem
                  key={`${item.type}-${item.recordId}`}
                  title={describeActivity(item)}
                  meta={formatRelativeTime(item.timestamp)}
                  dotColor={ACTIVITY_DOT_COLOR[item.type]}
                />
              ))
            )}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
