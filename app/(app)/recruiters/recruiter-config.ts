// Shared column/field configuration for the Recruiter module's list,
// detail, and form screens (create + edit both use RECRUITER_FORM_FIELDS,
// so a field's role restriction only has to be declared once).
import type { ListColumnConfig, ListFilterConfig } from "@/lib/list-config";
import type { DetailFieldConfig } from "@/lib/detail-config";
import type { FormFieldConfig } from "@/lib/form-config";

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "VETTING", label: "Vetting" },
  { value: "PAUSED", label: "Paused" },
  { value: "INACTIVE", label: "Inactive" },
];

const STATUS_MAP = {
  ACTIVE: { variant: "success" as const, label: "Active" },
  VETTING: { variant: "neutral" as const, label: "Vetting" },
  PAUSED: { variant: "warning" as const, label: "Paused" },
  INACTIVE: { variant: "critical" as const, label: "Inactive" },
};

const AGREEMENT_OPTIONS = [
  { value: "YES", label: "Signed" },
  { value: "NO", label: "Not Signed" },
  { value: "PENDING", label: "Pending" },
];

const AGREEMENT_MAP = {
  YES: { variant: "success" as const, label: "Signed" },
  NO: { variant: "critical" as const, label: "Not Signed" },
  PENDING: { variant: "warning" as const, label: "Pending" },
};

const QUALITY_OPTIONS = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
];

const QUALITY_MAP = {
  A: { variant: "success" as const, label: "A" },
  B: { variant: "warning" as const, label: "B" },
  C: { variant: "neutral" as const, label: "C" },
};

const INTRODUCTION_OPTIONS = [
  { value: "DIRECT", label: "Direct" },
  { value: "REFERRED_BY_ATHLETE", label: "Referred by Athlete" },
  { value: "REFERRED_BY_RECRUITER", label: "Referred by Recruiter" },
  { value: "OTHER", label: "Other" },
];

const INTRODUCTION_MAP = {
  DIRECT: { variant: "neutral" as const, label: "Direct" },
  REFERRED_BY_ATHLETE: { variant: "neutral" as const, label: "Referred by Athlete" },
  REFERRED_BY_RECRUITER: { variant: "neutral" as const, label: "Referred by Recruiter" },
  OTHER: { variant: "neutral" as const, label: "Other" },
};

export const RECRUITER_LIST_COLUMNS: ListColumnConfig[] = [
  { key: "name", type: "text" },
  { key: "phone", type: "text" },
  { key: "email", type: "text" },
  { key: "territory", type: "text" },
  { key: "stateFocus", type: "text" },
  { key: "status", type: "status", statusMap: STATUS_MAP },
  { key: "qualityScore", type: "status", statusMap: QUALITY_MAP },
];

export const RECRUITER_LIST_FILTERS: ListFilterConfig[] = [
  { key: "status", type: "select", options: STATUS_OPTIONS },
  { key: "stateFocus", type: "text" },
];

// Reflects exactly what GET /api/recruiters/[id] can return — the route
// sends the full row to both ADMIN and a recruiter viewing their own
// record (only writes are field-restricted, via
// RECRUITER_SELF_EDITABLE_FIELDS on PATCH). ConfigurableDetail does no
// role filtering of its own by design, so every field here renders for
// both viewers; RECRUITER_FORM_FIELDS below is what actually keeps a
// recruiter from editing the admin-tracked ones.
export const RECRUITER_DETAIL_FIELDS: DetailFieldConfig[] = [
  { key: "name", type: "text" },
  { key: "phone", type: "text" },
  { key: "email", type: "text" },
  { key: "territory", type: "text" },
  { key: "stateFocus", type: "text" },
  { key: "status", type: "status", statusMap: STATUS_MAP },
  { key: "agreementSigned", type: "status", statusMap: AGREEMENT_MAP },
  { key: "startDate", type: "date" },
  { key: "paymentTerms", type: "text" },
  { key: "leadsSubmitted", type: "number" },
  { key: "athletesSigned", type: "number" },
  { key: "revenueInfluenced", type: "currency" },
  { key: "qualityScore", type: "status", statusMap: QUALITY_MAP },
  { key: "introductionSource", type: "status", statusMap: INTRODUCTION_MAP },
  { key: "notes", type: "textarea", fullWidth: true },
];

// name/phone/email/territory/stateFocus have no `roles` — every role the
// form renders for may edit them. Every other field is ADMIN-only,
// matching RECRUITER_SELF_EDITABLE_FIELDS in lib/validation/recruiter.ts
// exactly — a RECRUITER's own edit form structurally never renders them.
export const RECRUITER_FORM_FIELDS: FormFieldConfig[] = [
  { name: "name", type: "text", required: true, placeholder: "e.g. Jordan Blake" },
  { name: "phone", type: "text", placeholder: "(555) 123-4567" },
  { name: "email", type: "text", placeholder: "name@example.com" },
  { name: "territory", type: "text", placeholder: "e.g. Southeast" },
  { name: "stateFocus", type: "text", placeholder: "e.g. Georgia" },
  { name: "status", type: "select", options: STATUS_OPTIONS, roles: ["ADMIN"] },
  {
    name: "agreementSigned",
    type: "select",
    options: AGREEMENT_OPTIONS,
    roles: ["ADMIN"],
  },
  { name: "startDate", type: "date", roles: ["ADMIN"] },
  { name: "paymentTerms", type: "text", roles: ["ADMIN"] },
  { name: "leadsSubmitted", type: "number", roles: ["ADMIN"] },
  { name: "athletesSigned", type: "number", roles: ["ADMIN"] },
  { name: "revenueInfluenced", type: "number", roles: ["ADMIN"] },
  {
    name: "qualityScore",
    type: "select",
    options: QUALITY_OPTIONS,
    roles: ["ADMIN"],
  },
  {
    name: "introductionSource",
    type: "select",
    options: INTRODUCTION_OPTIONS,
    roles: ["ADMIN"],
  },
  { name: "notes", type: "textarea", roles: ["ADMIN"] },
];

// ConfigurableForm always seeds every visible field with a value (""
// for an untouched text/select/date/number field — see
// buildInitialValues in lib/form-config.ts), so a submit would otherwise
// send e.g. status: "" for a field the caller never touched. The
// server's zod schemas are .strict() about unknown keys but still type-
// check known ones strictly too (z.nativeEnum(...).optional() rejects ""
// same as z.coerce.date() would) — omitting untouched fields entirely,
// rather than sending "", is what lets create/edit rely on the schema's
// own optional()/partial() defaults instead of re-deriving them here.
export function buildRecruiterPayload(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === "") continue;
    payload[key] = value;
  }
  return payload;
}
