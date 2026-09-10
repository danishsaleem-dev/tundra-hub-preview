// Static display-label lookup, defaulting to Tundra's real current terms.
// Deliberately a plain export, not a hook or context — there is no
// per-organization dynamic loading to support yet, and building one now
// would be scope beyond what M4 actually needs. If that ever changes,
// this is the one place that has to.
import { humanizeFieldName } from "@/lib/format";

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

// Field names that are foreign keys onto one of the five tracked entities
// (recruiterId, athleteId, nilDealId, ...) resolve to that entity's own
// label instead of an awkward humanized "Recruiter Id" — matching the
// suffix convention every real FK field in this schema already uses.
function fieldNameToEntityKey(fieldName: string): EntityKey | null {
  for (const key of Object.keys(ENTITY_LABELS) as EntityKey[]) {
    const suffix = key.charAt(0).toUpperCase() + key.slice(1) + "Id";
    if (fieldName === `${key}Id` || fieldName.endsWith(suffix)) {
      return key;
    }
  }
  return null;
}

// The one label-resolution function every config-driven system (forms,
// lists, detail views) calls through: explicit override first, then the
// entity-label lookup for FK-shaped field names, then humanizeFieldName
// as the fallback. None of those systems should ever hardcode a label
// directly in their own config.
export function resolveEntityAwareLabel(
  name: string,
  explicitLabel?: string,
): string {
  if (explicitLabel) return explicitLabel;
  const entityKey = fieldNameToEntityKey(name);
  if (entityKey) return ENTITY_LABELS[entityKey].singular;
  return humanizeFieldName(name);
}
