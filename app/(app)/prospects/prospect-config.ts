// Shared column/field configuration for the Prospect module's list,
// detail, and form screens. Unlike Recruiter, Prospect's RBAC is
// action-level and record-scope-level, not field-level (see
// lib/validation/prospect.ts's prospectWritableSchema comment) — a
// RECRUITER may edit every field on their own assigned prospect, so
// PROSPECT_FORM_FIELDS deliberately carries no `roles` restrictions.
// What differs by role is whether create/archive are reachable at all
// (gated in the list/detail clients via PROSPECT_ADMIN_ONLY_ACTIONS
// below) and which records are visible in the first place (the API's
// own recruiterId scoping — not re-derived here).
import type { UserRole } from "@prisma/client";
import type { ListColumnConfig, ListFilterConfig } from "@/lib/list-config";
import type { DetailFieldConfig } from "@/lib/detail-config";
import type { FormFieldConfig } from "@/lib/form-config";

// Single source of truth for "who can create/archive a Prospect" — both
// the list client (create button, archive row-action) and the detail
// client (archive/restore buttons, convert action) read this instead of
// each hardcoding role === "ADMIN" independently, so the two screens
// can't drift out of sync with each other.
export const PROSPECT_ADMIN_ONLY_ACTIONS: UserRole[] = ["ADMIN"];

const STATUS_OPTIONS = [
  { value: "NEW_LEAD", label: "New Lead" },
  { value: "FILM_REVIEW", label: "Film Review" },
  { value: "INTRO_CALL_SCHEDULED", label: "Intro Call Scheduled" },
  { value: "FAMILY_CALL_SCHEDULED", label: "Family Call Scheduled" },
  { value: "EVALUATING", label: "Evaluating" },
  { value: "OFFER_EXTENDED", label: "Offer Extended" },
  { value: "AGREEMENT_SENT", label: "Agreement Sent" },
  { value: "SIGNED", label: "Signed" },
  { value: "LOST", label: "Lost" },
  { value: "NURTURE", label: "Nurture" },
];

const STATUS_MAP = {
  NEW_LEAD: { variant: "neutral" as const, label: "New Lead" },
  FILM_REVIEW: { variant: "neutral" as const, label: "Film Review" },
  INTRO_CALL_SCHEDULED: { variant: "neutral" as const, label: "Intro Call Scheduled" },
  FAMILY_CALL_SCHEDULED: { variant: "neutral" as const, label: "Family Call Scheduled" },
  EVALUATING: { variant: "warning" as const, label: "Evaluating" },
  OFFER_EXTENDED: { variant: "warning" as const, label: "Offer Extended" },
  AGREEMENT_SENT: { variant: "warning" as const, label: "Agreement Sent" },
  SIGNED: { variant: "success" as const, label: "Signed" },
  LOST: { variant: "critical" as const, label: "Lost" },
  NURTURE: { variant: "neutral" as const, label: "Nurture" },
};

const TIER_OPTIONS = [
  { value: "TIER_A", label: "Tier A" },
  { value: "TIER_B", label: "Tier B" },
  { value: "TIER_C", label: "Tier C" },
];

const TIER_MAP = {
  TIER_A: { variant: "success" as const, label: "Tier A" },
  TIER_B: { variant: "warning" as const, label: "Tier B" },
  TIER_C: { variant: "neutral" as const, label: "Tier C" },
};

const POSITION_OPTIONS = [
  { value: "QB", label: "QB" },
  { value: "WR", label: "WR" },
  { value: "RB", label: "RB" },
  { value: "TE", label: "TE" },
  { value: "OL", label: "OL" },
  { value: "DL", label: "DL" },
  { value: "LB", label: "LB" },
  { value: "DB", label: "DB" },
  { value: "K_P", label: "K/P" },
];

const REPRESENTATION_OPTIONS = [
  { value: "NONE", label: "None" },
  { value: "PARENT_LED", label: "Parent-Led" },
  { value: "ADVISOR", label: "Advisor" },
  { value: "MARKETING_REP", label: "Marketing Rep" },
  { value: "AGENT", label: "Agent" },
  { value: "ATTORNEY", label: "Attorney" },
  { value: "COLLECTIVE_CONNECTED", label: "Collective-Connected" },
  { value: "UNKNOWN", label: "Unknown" },
];

const REPRESENTATION_MAP = {
  NONE: { variant: "neutral" as const, label: "None" },
  PARENT_LED: { variant: "neutral" as const, label: "Parent-Led" },
  ADVISOR: { variant: "neutral" as const, label: "Advisor" },
  MARKETING_REP: { variant: "neutral" as const, label: "Marketing Rep" },
  AGENT: { variant: "neutral" as const, label: "Agent" },
  ATTORNEY: { variant: "neutral" as const, label: "Attorney" },
  COLLECTIVE_CONNECTED: { variant: "neutral" as const, label: "Collective-Connected" },
  UNKNOWN: { variant: "neutral" as const, label: "Unknown" },
};

export const PROSPECT_LIST_COLUMNS: ListColumnConfig[] = [
  { key: "fullName", type: "text", label: "Name" },
  { key: "recruiterName", type: "text", label: "Assigned Recruiter" },
  { key: "status", type: "status", statusMap: STATUS_MAP },
  { key: "priorityTier", type: "status", label: "Priority Tier", statusMap: TIER_MAP },
  { key: "lastContactDate", type: "date", label: "Last Contact" },
];

export const PROSPECT_LIST_FILTERS: ListFilterConfig[] = [
  { key: "status", type: "select", options: STATUS_OPTIONS },
  { key: "priorityTier", type: "select", label: "Priority Tier", options: TIER_OPTIONS },
];

// Reflects exactly what GET /api/prospects/[id] returns — full row for
// both ADMIN and a recruiter viewing their own assigned prospect (no
// field-level read restriction exists on this route). recruiterId
// itself isn't shown/edited here — reassignment would need a real
// recruiter-picker UI this module doesn't build; recruiterName (already
// resolved server-side) covers "who owns this" as read-only info.
// socialLinks (unstructured JSON) is likewise left out of both the
// detail view and the form — no UI for editing arbitrary JSON exists.
export const PROSPECT_DETAIL_FIELDS: DetailFieldConfig[] = [
  { key: "fullName", type: "text", label: "Name" },
  { key: "email", type: "text" },
  { key: "phone", type: "text" },
  { key: "recruiterName", type: "text", label: "Assigned Recruiter" },
  { key: "position", type: "text" },
  { key: "school", type: "text" },
  { key: "classYear", type: "text", label: "Class Year" },
  { key: "state", type: "text" },
  { key: "status", type: "status", statusMap: STATUS_MAP },
  { key: "priorityTier", type: "status", label: "Priority Tier", statusMap: TIER_MAP },
  { key: "lastContactDate", type: "date", label: "Last Contact" },
  { key: "nextActionDate", type: "date", label: "Next Action" },
  { key: "nextStep", type: "text", label: "Next Step" },
  {
    key: "knownRepresentationStatus",
    type: "status",
    label: "Representation Status",
    statusMap: REPRESENTATION_MAP,
  },
  { key: "parentGuardianName", type: "text", label: "Parent / Guardian" },
  { key: "parentPhone", type: "text", label: "Parent / Guardian Phone" },
  { key: "filmLink", type: "text", label: "Film Link" },
  { key: "scoutingNotes", type: "textarea", fullWidth: true },
  { key: "evaluationNotes", type: "textarea", fullWidth: true },
];

// No `roles` anywhere below — every field here is writable by both ADMIN
// and a RECRUITER editing their own assigned prospect, matching
// prospectWritableSchema's single (non-role-split) schema exactly.
export const PROSPECT_FORM_FIELDS: FormFieldConfig[] = [
  { name: "fullName", type: "text", required: true, placeholder: "e.g. Jordan Blake" },
  { name: "email", type: "text", placeholder: "name@example.com" },
  { name: "phone", type: "text", placeholder: "(555) 123-4567" },
  { name: "position", type: "select", options: POSITION_OPTIONS },
  { name: "school", type: "text", placeholder: "e.g. Central High School" },
  { name: "classYear", type: "text", placeholder: "e.g. 2027" },
  { name: "state", type: "text", placeholder: "e.g. Georgia" },
  { name: "status", type: "select", options: STATUS_OPTIONS },
  { name: "priorityTier", type: "select", options: TIER_OPTIONS },
  { name: "lastContactDate", type: "date" },
  { name: "nextActionDate", type: "date" },
  { name: "nextStep", type: "text", placeholder: "e.g. Schedule family call" },
  {
    name: "knownRepresentationStatus",
    type: "select",
    options: REPRESENTATION_OPTIONS,
  },
  { name: "parentGuardianName", type: "text" },
  { name: "parentPhone", type: "text" },
  { name: "filmLink", type: "text", placeholder: "https://..." },
  { name: "scoutingNotes", type: "textarea" },
  { name: "evaluationNotes", type: "textarea" },
];

// Same "omit empty values rather than send them" reasoning as
// buildRecruiterPayload in ../recruiters/recruiter-config.ts.
export function buildProspectPayload(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === "") continue;
    payload[key] = value;
  }
  return payload;
}
