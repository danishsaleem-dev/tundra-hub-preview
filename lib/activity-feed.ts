import "server-only";
import { prisma } from "@/lib/prisma";

// There is no activity-log table anywhere in this schema — every item
// here is derived from createdAt/updatedAt on the record itself. That
// makes "a record was just created" unambiguous, but makes anything
// keyed on updatedAt (SIGNED deals, PAID payments, ACTIVE recruiters)
// fuzzier: updatedAt changes on ANY edit, not specifically the
// transition into that state. A "Deal signed" entry means "currently
// SIGNED, most recently touched" — it is NOT a record of the moment the
// deal was actually signed, and a deal signed months ago with an
// unrelated edit last week will outrank one genuinely signed yesterday.
// The description wording below is chosen to read honestly given that
// (no "just" or "recently" language on the updatedAt-based entries).
export type ActivityItemType =
  | "ATHLETE_CREATED"
  | "PROSPECT_CREATED"
  | "DEAL_CREATED"
  | "DEAL_SIGNED"
  | "PAYMENT_CREATED"
  | "PAYMENT_RECEIVED"
  | "RECRUITER_ACTIVATED";

export interface ActivityItem {
  type: ActivityItemType;
  description: string;
  timestamp: string;
  recordId: string;
}

// null = unscoped (Admin sees everything). A recruiterId scopes every
// source to that recruiter's own assigned Athletes/Prospects/NilDeals,
// and Payments on those deals — the same joins already proven correct
// in each module's own RBAC. Deliberately excludes RECRUITER_ACTIVATED
// for a scoped caller: a Recruiter has never had visibility into other
// Recruiter records anywhere in this app (not even a list of them), so
// surfacing "Recruiter X activated" to a different recruiter would be a
// genuinely new exposure this feed shouldn't introduce on its own. Only
// Admin sees that source.
export interface ActivityScope {
  recruiterId: string | null;
}

const PER_SOURCE_TAKE = 20;
const FEED_LIMIT = 15;

export async function getActivityFeed(scope: ActivityScope): Promise<ActivityItem[]> {
  const recruiterScope = scope.recruiterId;

  const athleteWhere = {
    archived: false,
    ...(recruiterScope ? { recruiterId: recruiterScope } : {}),
  };
  const prospectWhere = {
    archived: false,
    ...(recruiterScope ? { recruiterId: recruiterScope } : {}),
  };
  const dealScopeFilter = recruiterScope
    ? { athlete: { recruiterId: recruiterScope } }
    : {};
  const paymentScopeFilter = recruiterScope
    ? { nilDeal: { athlete: { recruiterId: recruiterScope } } }
    : {};

  const [
    newAthletes,
    newProspects,
    newDeals,
    signedDeals,
    newPayments,
    paidPayments,
    activatedRecruiters,
  ] = await Promise.all([
    prisma.athlete.findMany({
      where: athleteWhere,
      orderBy: { createdAt: "desc" },
      take: PER_SOURCE_TAKE,
      select: { id: true, athleteName: true, createdAt: true },
    }),
    prisma.prospect.findMany({
      where: prospectWhere,
      orderBy: { createdAt: "desc" },
      take: PER_SOURCE_TAKE,
      select: { id: true, fullName: true, createdAt: true },
    }),
    prisma.nilDeal.findMany({
      where: { archived: false, ...dealScopeFilter },
      orderBy: { createdAt: "desc" },
      take: PER_SOURCE_TAKE,
      select: { id: true, dealName: true, createdAt: true },
    }),
    prisma.nilDeal.findMany({
      where: { archived: false, contractStatus: "SIGNED", ...dealScopeFilter },
      orderBy: { updatedAt: "desc" },
      take: PER_SOURCE_TAKE,
      select: { id: true, dealName: true, updatedAt: true },
    }),
    prisma.payment.findMany({
      where: { archived: false, ...paymentScopeFilter },
      orderBy: { createdAt: "desc" },
      take: PER_SOURCE_TAKE,
      select: { id: true, paymentName: true, isAutoCreated: true, createdAt: true },
    }),
    prisma.payment.findMany({
      where: { archived: false, status: "PAID", ...paymentScopeFilter },
      orderBy: { updatedAt: "desc" },
      take: PER_SOURCE_TAKE,
      select: { id: true, paymentName: true, updatedAt: true },
    }),
    recruiterScope
      ? Promise.resolve([])
      : prisma.recruiter.findMany({
          where: { archived: false, inviteStatus: "ACTIVE" },
          orderBy: { updatedAt: "desc" },
          take: PER_SOURCE_TAKE,
          select: { id: true, name: true, updatedAt: true },
        }),
  ]);

  const items: ActivityItem[] = [
    ...newAthletes.map((a) => ({
      type: "ATHLETE_CREATED" as const,
      description: `New athlete added: ${a.athleteName}`,
      timestamp: a.createdAt.toISOString(),
      recordId: a.id,
    })),
    ...newProspects.map((p) => ({
      type: "PROSPECT_CREATED" as const,
      description: `New prospect added: ${p.fullName}`,
      timestamp: p.createdAt.toISOString(),
      recordId: p.id,
    })),
    ...newDeals.map((d) => ({
      type: "DEAL_CREATED" as const,
      description: `New deal created: ${d.dealName}`,
      timestamp: d.createdAt.toISOString(),
      recordId: d.id,
    })),
    ...signedDeals.map((d) => ({
      type: "DEAL_SIGNED" as const,
      // Deliberately not "just signed" or "recently signed" — see the
      // file-level comment on why that would overstate what updatedAt
      // actually tells us.
      description: `Deal signed: ${d.dealName}`,
      timestamp: d.updatedAt.toISOString(),
      recordId: d.id,
    })),
    ...newPayments.map((p) => ({
      type: "PAYMENT_CREATED" as const,
      description: p.isAutoCreated
        ? `New payment auto-created: ${p.paymentName}`
        : `New payment added: ${p.paymentName}`,
      timestamp: p.createdAt.toISOString(),
      recordId: p.id,
    })),
    ...paidPayments.map((p) => ({
      type: "PAYMENT_RECEIVED" as const,
      description: `Payment received: ${p.paymentName}`,
      timestamp: p.updatedAt.toISOString(),
      recordId: p.id,
    })),
    ...activatedRecruiters.map((r) => ({
      type: "RECRUITER_ACTIVATED" as const,
      description: `Recruiter activated: ${r.name}`,
      timestamp: r.updatedAt.toISOString(),
      recordId: r.id,
    })),
  ];

  items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return items.slice(0, FEED_LIMIT);
}
