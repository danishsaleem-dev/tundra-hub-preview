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
// This returns structured data, not prose — the caller (the dashboard
// component) assembles the final sentence using the entity-label lookup,
// so a label change propagates here without this file knowing anything
// about display strings. The wording chosen by that assembly is what
// reads honestly given the above (no "just" or "recently" language on the
// updatedAt-based entries) — this file only owns which record and which
// event, not the sentence.
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
  entityName: string;
  timestamp: string;
  recordId: string;
  // Only meaningful for PAYMENT_CREATED — which of the two sentence
  // templates the frontend should use.
  isAutoCreated?: boolean;
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
      entityName: a.athleteName,
      timestamp: a.createdAt.toISOString(),
      recordId: a.id,
    })),
    ...newProspects.map((p) => ({
      type: "PROSPECT_CREATED" as const,
      entityName: p.fullName,
      timestamp: p.createdAt.toISOString(),
      recordId: p.id,
    })),
    ...newDeals.map((d) => ({
      type: "DEAL_CREATED" as const,
      entityName: d.dealName,
      timestamp: d.createdAt.toISOString(),
      recordId: d.id,
    })),
    ...signedDeals.map((d) => ({
      type: "DEAL_SIGNED" as const,
      entityName: d.dealName,
      timestamp: d.updatedAt.toISOString(),
      recordId: d.id,
    })),
    ...newPayments.map((p) => ({
      type: "PAYMENT_CREATED" as const,
      entityName: p.paymentName,
      isAutoCreated: p.isAutoCreated,
      timestamp: p.createdAt.toISOString(),
      recordId: p.id,
    })),
    ...paidPayments.map((p) => ({
      type: "PAYMENT_RECEIVED" as const,
      entityName: p.paymentName,
      timestamp: p.updatedAt.toISOString(),
      recordId: p.id,
    })),
    ...activatedRecruiters.map((r) => ({
      type: "RECRUITER_ACTIVATED" as const,
      entityName: r.name,
      timestamp: r.updatedAt.toISOString(),
      recordId: r.id,
    })),
  ];

  items.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return items.slice(0, FEED_LIMIT);
}
