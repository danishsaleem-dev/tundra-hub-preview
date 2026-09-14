// Shared column/field configuration for the NIL Deal module's list,
// detail, and form screens. RECRUITER has zero write access to NilDeal
// (matches Athlete's precedent, not Prospect's) — create/edit/archive
// are ADMIN-only throughout, enforced by the page/client gates, not by
// any `roles` filtering on individual fields here (there's nothing for
// a RECRUITER to structurally exclude on a form they never render).
import type { ListColumnConfig, ListFilterConfig } from "@/lib/list-config";
import type { DetailFieldConfig } from "@/lib/detail-config";
import type { FormFieldConfig, FieldOption } from "@/lib/form-config";

const CONTRACT_STATUS_OPTIONS = [
  { value: "DRAFTING", label: "Drafting" },
  { value: "SENT", label: "Sent" },
  { value: "SIGNED", label: "Signed" },
  { value: "COMPLETED", label: "Completed" },
];

const CONTRACT_STATUS_MAP = {
  DRAFTING: { variant: "neutral" as const, label: "Drafting" },
  SENT: { variant: "warning" as const, label: "Sent" },
  SIGNED: { variant: "success" as const, label: "Signed" },
  COMPLETED: { variant: "neutral" as const, label: "Completed" },
};

const DEAL_TYPE_OPTIONS = [
  { value: "NIL_DEAL", label: "NIL Deal" },
  { value: "APPEARANCE", label: "Appearance" },
  { value: "AUTOGRAPH_SIGNING", label: "Autograph Signing" },
  { value: "CAMP_CLINIC", label: "Camp / Clinic" },
  { value: "BRAND_AMBASSADOR", label: "Brand Ambassador" },
  { value: "SOCIAL_MEDIA_CAMPAIGN", label: "Social Media Campaign" },
  { value: "COMMERCIAL", label: "Commercial" },
  { value: "EVENT_PARTNERSHIP", label: "Event Partnership" },
  { value: "PRODUCT_GIFTING", label: "Product Gifting" },
  { value: "CONTENT_COLLABORATION", label: "Content Collaboration" },
  { value: "SPEAKING_PANEL", label: "Speaking / Panel" },
  { value: "OTHER", label: "Other" },
];

const DISCLOSURE_STATUS_OPTIONS = [
  { value: "REQUIRED", label: "Required" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "NOT_REQUIRED", label: "Not Required" },
];

const DISCLOSURE_STATUS_MAP = {
  REQUIRED: { variant: "warning" as const, label: "Required" },
  SUBMITTED: { variant: "success" as const, label: "Submitted" },
  NOT_REQUIRED: { variant: "neutral" as const, label: "Not Required" },
};

const PAYMENT_STRUCTURE_OPTIONS = [
  { value: "LUMP_SUM", label: "Lump Sum" },
  { value: "INSTALLMENTS", label: "Installments" },
];

export const NIL_DEAL_LIST_COLUMNS: ListColumnConfig[] = [
  { key: "dealName", type: "text", label: "Deal Name" },
  { key: "athleteName", type: "text", label: "Athlete" },
  { key: "brandName", type: "text", label: "Brand" },
  { key: "dealType", type: "text", label: "Deal Type" },
  { key: "dealValue", type: "currency", label: "Deal Value" },
  { key: "contractStatus", type: "status", label: "Contract Status", statusMap: CONTRACT_STATUS_MAP },
];

export const NIL_DEAL_LIST_FILTERS: ListFilterConfig[] = [
  { key: "contractStatus", type: "select", label: "Contract Status", options: CONTRACT_STATUS_OPTIONS },
  { key: "dealType", type: "select", label: "Deal Type", options: DEAL_TYPE_OPTIONS },
];

// Reflects exactly what GET /api/nil-deals/[id] returns — the deal's own
// fields only. Linked payments are a completely separate section on the
// detail page (not a ConfigurableDetail field), rendered directly from
// the same response's `payments` array.
export const NIL_DEAL_DETAIL_FIELDS: DetailFieldConfig[] = [
  { key: "dealName", type: "text", label: "Deal Name" },
  { key: "athleteName", type: "text", label: "Athlete" },
  { key: "brandName", type: "text", label: "Brand" },
  { key: "dealType", type: "text", label: "Deal Type" },
  { key: "contractStatus", type: "status", label: "Contract Status", statusMap: CONTRACT_STATUS_MAP },
  { key: "dealValue", type: "currency", label: "Deal Value" },
  { key: "agencyFee", type: "currency", label: "Agency Fee" },
  { key: "athleteNet", type: "currency", label: "Athlete Net" },
  { key: "paymentStructure", type: "text", label: "Payment Structure" },
  { key: "schoolDisclosure", type: "status", label: "School Disclosure", statusMap: DISCLOSURE_STATUS_MAP },
  { key: "ftcGuidanceSent", type: "boolean", label: "FTC Guidance Sent" },
  { key: "deadline", type: "date" },
  { key: "deliverables", type: "textarea", fullWidth: true },
  { key: "notes", type: "textarea", fullWidth: true },
];

// athleteId's options are populated dynamically (fetchAthleteOptions
// below) since there's no static enum to list here — both create and
// edit share this one field list, so an admin can also correct which
// athlete a deal belongs to during edit, matching what the API already
// permits (nilDealUpdateSchema includes athleteId, same as create).
export function buildNilDealFormFields(athleteOptions: FieldOption[]): FormFieldConfig[] {
  return [
    { name: "dealName", type: "text", required: true, placeholder: "e.g. Fall Campaign" },
    { name: "athleteId", type: "select", label: "Athlete", required: true, options: athleteOptions },
    { name: "brandName", type: "text", placeholder: "e.g. Northwind Gear" },
    { name: "dealType", type: "select", options: DEAL_TYPE_OPTIONS },
    { name: "contractStatus", type: "select", label: "Contract Status", options: CONTRACT_STATUS_OPTIONS },
    { name: "dealValue", type: "number", label: "Deal Value" },
    { name: "agencyFee", type: "number", label: "Agency Fee" },
    { name: "athleteNet", type: "number", label: "Athlete Net" },
    { name: "paymentStructure", type: "select", label: "Payment Structure", options: PAYMENT_STRUCTURE_OPTIONS },
    { name: "schoolDisclosure", type: "select", label: "School Disclosure", options: DISCLOSURE_STATUS_OPTIONS },
    { name: "ftcGuidanceSent", type: "boolean", label: "FTC Guidance Sent" },
    { name: "deadline", type: "date" },
    { name: "deliverables", type: "textarea" },
    { name: "notes", type: "textarea" },
  ];
}

// No dedicated athlete-picker component exists yet — this fetches a
// reasonably-sized page of real athletes (matches this app's actual
// current scale) rather than inventing a search-as-you-type UI beyond
// today's scope. ADMIN-only caller, so this always hits the unscoped
// admin branch of GET /api/athletes.
export async function fetchAthleteOptions(): Promise<FieldOption[]> {
  const res = await fetch("/api/athletes?pageSize=100");
  if (!res.ok) return [];
  const body = await res.json().catch(() => null);
  const athletes = (body?.athletes ?? []) as { id: string; athleteName: string }[];
  return athletes.map((athlete) => ({ value: athlete.id, label: athlete.athleteName }));
}

// Same "omit empty values rather than send them" reasoning as every
// other module's payload builder.
export function buildNilDealPayload(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === "") continue;
    payload[key] = value;
  }
  return payload;
}
