// Static display-label lookup, defaulting to Tundra's real current terms.
// Deliberately a plain export, not a hook or context — there is no
// per-organization dynamic loading to support yet, and building one now
// would be scope beyond what M4 actually needs. If that ever changes,
// this is the one place that has to.
export interface EntityLabel {
  singular: string;
  plural: string;
}

export const ENTITY_LABELS = {
  athlete: { singular: "Athlete", plural: "Athletes" },
  recruiter: { singular: "Recruiter", plural: "Recruiters" },
  prospect: { singular: "Prospect", plural: "Prospects" },
  nilDeal: { singular: "NIL Deal", plural: "NIL Deals" },
  payment: { singular: "Payment", plural: "Payments" },
} as const satisfies Record<string, EntityLabel>;

export type EntityKey = keyof typeof ENTITY_LABELS;

export const PRODUCT_IDENTITY = {
  organizationName: "Tundra Sports Group",
  productName: "Tundra Sports Hub",
} as const;
