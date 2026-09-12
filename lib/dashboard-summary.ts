import "server-only";
import { Prisma, type ContractStatus, type PaymentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { withComputedPaymentFieldsList } from "@/lib/payment-computed";

export interface DashboardSummary {
  activeAthleteCount: number;
  nilDeals: {
    // "Active" = contractStatus SIGNED — a deal isn't active yet while
    // drafting/sent, and isn't active anymore once completed. Matches the
    // reference dashboard mockup's "X active / Y total" framing.
    activeCount: number;
    activeTotalContractValue: string;
    // Every contractStatus represented (0 where there are no rows), scoped
    // to non-archived deals — full-picture counts independent of the
    // "active" definition above.
    breakdownByStatus: Record<ContractStatus, number>;
  };
  payments: {
    // Non-archived only — this is "what needs attention right now".
    totalOutstandingReceivables: string;
    // Deliberately NOT scoped to non-archived — a lifetime collected total
    // is a historical fact; money actually received shouldn't stop
    // counting because the record was later archived for tidiness.
    totalCollectedLifetime: string;
    // Non-archived only, using the exact same isOverdue/amountOutstanding
    // logic the Payments module itself uses (withComputedPaymentFields) —
    // not a separate reimplementation of what "overdue" means.
    overdueCount: number;
    overdueTotalAmount: string;
  };
}

const ALL_CONTRACT_STATUSES: ContractStatus[] = [
  "DRAFTING",
  "SENT",
  "SIGNED",
  "COMPLETED",
];

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [
    activeAthleteCount,
    signedDealAggregate,
    dealStatusGroups,
    nonArchivedPayments,
    lifetimeCollectedAggregate,
  ] = await Promise.all([
    prisma.athlete.count({ where: { archived: false } }),
    prisma.nilDeal.aggregate({
      where: { archived: false, contractStatus: "SIGNED" },
      _count: { _all: true },
      _sum: { dealValue: true },
    }),
    prisma.nilDeal.groupBy({
      by: ["contractStatus"],
      where: { archived: false },
      _count: { _all: true },
    }),
    // Full rows, not just a sum — isOverdue/amountOutstanding are computed
    // per-row by withComputedPaymentFields, not expressible as a single
    // SQL aggregate.
    prisma.payment.findMany({ where: { archived: false } }),
    prisma.payment.aggregate({ _sum: { amountPaid: true } }),
  ]);

  const breakdownByStatus = Object.fromEntries(
    ALL_CONTRACT_STATUSES.map((status) => [status, 0]),
  ) as Record<ContractStatus, number>;
  for (const group of dealStatusGroups) {
    breakdownByStatus[group.contractStatus] = group._count._all;
  }

  const computedPayments = withComputedPaymentFieldsList(nonArchivedPayments);
  const overduePayments = computedPayments.filter((p) => p.isOverdue);

  const totalOutstandingReceivables = computedPayments
    .reduce((sum, p) => sum.plus(p.amountOutstanding), new Prisma.Decimal(0))
    .toFixed(2);
  const overdueTotalAmount = overduePayments
    .reduce((sum, p) => sum.plus(p.amountOutstanding), new Prisma.Decimal(0))
    .toFixed(2);

  return {
    activeAthleteCount,
    nilDeals: {
      activeCount: signedDealAggregate._count._all,
      activeTotalContractValue: (
        signedDealAggregate._sum.dealValue ?? new Prisma.Decimal(0)
      ).toFixed(2),
      breakdownByStatus,
    },
    payments: {
      totalOutstandingReceivables,
      totalCollectedLifetime: (
        lifetimeCollectedAggregate._sum.amountPaid ?? new Prisma.Decimal(0)
      ).toFixed(2),
      overdueCount: overduePayments.length,
      overdueTotalAmount,
    },
  };
}

export interface PaymentHealthItem {
  id: string;
  paymentName: string;
  brandName: string | null;
  athleteName: string;
  amountOutstanding: string;
  paymentAmount: string;
  status: PaymentStatus;
  isOverdue: boolean;
  dueDate: string | null;
}

// The dashboard's "Payment Health" panel — a real, small, at-a-glance
// slice of Payments, not the full list (that's the real Payments module's
// job once it exists). Ordered by dueDate ascending (soonest-due first,
// nulls last) so what needs attention soonest surfaces first, same
// isOverdue/amountOutstanding definition as everywhere else
// (withComputedPaymentFieldsList), not a separate reimplementation.
//
// null recruiterId = unscoped (admin sees everything), matching the same
// scoping shape getActivityFeed() already uses — there's no
// Recruiter-facing Payment Health panel yet to call this with a real
// recruiterId (Recruiter's own dashboard has no payments panel at all),
// but the function is scoped correctly now rather than needing a rewrite
// whenever that panel gets built.
export async function getPaymentHealthList(
  scope: { recruiterId: string | null },
  limit = 6,
): Promise<PaymentHealthItem[]> {
  const recruiterScope = scope.recruiterId;

  const payments = await prisma.payment.findMany({
    where: {
      archived: false,
      ...(recruiterScope
        ? { nilDeal: { athlete: { recruiterId: recruiterScope } } }
        : {}),
    },
    orderBy: { dueDate: { sort: "asc", nulls: "last" } },
    take: limit,
    include: {
      nilDeal: {
        select: { brandName: true, athlete: { select: { athleteName: true } } },
      },
    },
  });

  return withComputedPaymentFieldsList(payments).map((payment) => ({
    id: payment.id,
    paymentName: payment.paymentName,
    brandName: payment.nilDeal.brandName,
    athleteName: payment.nilDeal.athlete.athleteName,
    amountOutstanding: payment.amountOutstanding,
    paymentAmount: payment.paymentAmount.toFixed(2),
    status: payment.status,
    isOverdue: payment.isOverdue,
    dueDate: payment.dueDate ? payment.dueDate.toISOString() : null,
  }));
}
