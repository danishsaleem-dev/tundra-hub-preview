import { Sparkles, ListTodo } from "lucide-react";
import { AlertBanner } from "@/components/AlertBanner";
import { KpiCard } from "@/components/KpiCard";
import { Panel } from "@/components/Panel";
import { StatusChip } from "@/components/StatusChip";
import { ListRow } from "@/components/ListRow";
import { ActivityItem } from "@/components/ActivityItem";
import { EmptyState } from "@/components/EmptyState";
import type { StatusVariant } from "@/lib/status";
import type { DashboardSummary, PaymentHealthItem } from "@/lib/dashboard-summary";
import type { ActivityItem as ActivityFeedItem } from "@/lib/activity-feed";
import { formatCurrency, formatRelativeTime } from "@/lib/format";
import { ENTITY_LABELS } from "@/lib/labels";
import { paymentStatusChip } from "@/lib/payment-display";

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
  paymentHealth: PaymentHealthItem[];
}

export function AdminDashboardContent({
  summary,
  activity,
  paymentHealth,
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
          {paymentHealth.length === 0 ? (
            <EmptyState
              icon={ListTodo}
              title={`No ${ENTITY_LABELS.payment.plural.toLowerCase()} yet`}
              description={`${ENTITY_LABELS.payment.plural} will show up here once they exist.`}
            />
          ) : (
            <ul className="divide-y divide-card-tint">
              {paymentHealth.map((payment) => {
                const chip = paymentStatusChip(payment);
                return (
                  <ListRow
                    key={payment.id}
                    title={payment.paymentName}
                    meta={[payment.brandName, payment.athleteName]
                      .filter(Boolean)
                      .join(" · ")}
                    trailing={
                      <>
                        <span className="text-sm font-semibold text-surface-navy">
                          {formatCurrency(payment.amountOutstanding)}
                        </span>
                        <StatusChip variant={chip.variant} label={chip.label} />
                      </>
                    }
                  />
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel title="Priority Actions">
          <EmptyState
            icon={ListTodo}
            title="No tasks yet"
            description="Task tracking isn't built yet — this becomes available once the Tasks module ships."
          />
        </Panel>

        <Panel title="AI Executive Briefing" icon={Sparkles}>
          <EmptyState
            icon={Sparkles}
            title="AI insights not yet available"
            description="Executive briefing generation isn't built yet — this becomes available once it ships."
          />
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
