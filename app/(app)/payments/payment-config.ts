// Shared column/field configuration for the Payment module's list,
// detail, and form screens. RECRUITER has zero write access to Payment
// (matches Athlete/NilDeal's precedent) — create/edit/archive are
// ADMIN-only throughout, enforced by the page/client gates.
//
// invoiceSentDate is deliberately never a FormFieldConfig here — it's
// meant to auto-stamp server-side (lib/payment-data.ts's
// applyInvoiceSentAutoStamp) when invoiceSent flips false->true, not be
// manually set. The API technically accepts an explicit value for it
// (it's a real, non-.strict()-excluded schema field), but structurally
// leaving it off every form this module renders is what makes the UI
// actually respect "read-only, auto-stamped" rather than just not
// bothering to explain a field an admin could still edit.
import type { UserRole } from "@prisma/client";
import type { ListColumnConfig, ListFilterConfig } from "@/lib/list-config";
import type { DetailFieldConfig } from "@/lib/detail-config";
import type { FormFieldConfig, FieldOption } from "@/lib/form-config";

export const PAYMENT_ADMIN_ONLY_ACTIONS: UserRole[] = ["ADMIN"];

const STATUS_OPTIONS = [
  { value: "PENDING", label: "Pending" },
  { value: "PARTIAL", label: "Partial" },
  { value: "PAID", label: "Paid" },
];

const STATUS_MAP = {
  PENDING: { variant: "neutral" as const, label: "Pending" },
  PARTIAL: { variant: "warning" as const, label: "Partial" },
  PAID: { variant: "success" as const, label: "Paid" },
};

// Keyed by String(isOverdue) — ConfigurableList/ConfigurableDetail's
// "status" renderer does `statusMap?.[String(value)]`, and
// String(true)/String(false) are exactly "true"/"false", so the real
// computed boolean can drive this directly with no adapter field.
const OVERDUE_MAP = {
  true: { variant: "critical" as const, label: "Overdue" },
  false: { variant: "neutral" as const, label: "On Time" },
};

const COLLECTION_REQUIRED_MAP = {
  true: { variant: "warning" as const, label: "Required" },
  false: { variant: "neutral" as const, label: "Not Required" },
};

export const PAYMENT_LIST_COLUMNS: ListColumnConfig[] = [
  { key: "paymentName", type: "text", label: "Payment Name" },
  { key: "dealName", type: "text", label: "Linked Deal" },
  { key: "paymentAmount", type: "currency", label: "Amount" },
  { key: "status", type: "status", statusMap: STATUS_MAP },
  { key: "dueDate", type: "date", label: "Due Date" },
  { key: "isOverdue", type: "status", label: "Overdue", statusMap: OVERDUE_MAP },
];

export const PAYMENT_LIST_FILTERS: ListFilterConfig[] = [
  { key: "status", type: "select", options: STATUS_OPTIONS },
];

// Reflects exactly what GET /api/payments/[id] returns — every field
// here (including the four computed ones) comes straight from the API
// response, none of it recalculated in this module. invoiceSentDate
// appears here as plain read-only display, same as every other detail
// field — ConfigurableDetail has no edit affordance of its own; only
// the separate edit-mode form (which excludes this field) can change
// anything.
export const PAYMENT_DETAIL_FIELDS: DetailFieldConfig[] = [
  { key: "paymentName", type: "text", label: "Payment Name" },
  { key: "dealName", type: "text", label: "Linked Deal" },
  { key: "status", type: "status", statusMap: STATUS_MAP },
  { key: "paymentAmount", type: "currency", label: "Payment Amount" },
  { key: "amountPaid", type: "currency", label: "Amount Paid" },
  { key: "amountOutstanding", type: "currency", label: "Amount Outstanding" },
  { key: "isOverdue", type: "status", label: "Is Overdue", statusMap: OVERDUE_MAP },
  {
    key: "collectionRequired",
    type: "status",
    label: "Collection Required",
    statusMap: COLLECTION_REQUIRED_MAP,
  },
  { key: "daysSinceInvoiceSent", type: "number", label: "Days Since Invoice Sent" },
  { key: "dueDate", type: "date", label: "Due Date" },
  { key: "paymentDate", type: "date", label: "Payment Date" },
  { key: "invoiceSent", type: "boolean", label: "Invoice Sent" },
  { key: "invoiceSentDate", type: "date", label: "Invoice Sent Date" },
  { key: "invoiceId", type: "text", label: "Invoice ID" },
  { key: "paymentLink", type: "text", label: "Payment Link" },
  { key: "notes", type: "textarea", fullWidth: true },
];

// nilDealId's options are populated dynamically (fetchNilDealOptions
// below), same reasoning as NIL Deal's athlete picker — no static enum
// to list, and no dedicated picker component exists yet. Pass `null`
// when the caller already knows the deal (creating from within a NIL
// Deal's own detail page) to structurally omit the field entirely —
// the admin is already looking at that deal, a second "which deal"
// dropdown would just be redundant and an easy way to misfile a
// payment onto the wrong deal.
export function buildPaymentFormFields(
  nilDealOptions: FieldOption[] | null,
): FormFieldConfig[] {
  return [
    { name: "paymentName", type: "text", required: true, placeholder: "e.g. Q1 Installment" },
    ...(nilDealOptions
      ? ([
          {
            name: "nilDealId",
            type: "select",
            label: "Linked Deal",
            required: true,
            options: nilDealOptions,
          },
        ] as FormFieldConfig[])
      : []),
    { name: "paymentAmount", type: "number", label: "Payment Amount", required: true },
    { name: "amountPaid", type: "number", label: "Amount Paid" },
    { name: "status", type: "select", options: STATUS_OPTIONS },
    { name: "dueDate", type: "date", label: "Due Date" },
    { name: "paymentDate", type: "date", label: "Payment Date" },
    { name: "invoiceSent", type: "boolean", label: "Invoice Sent" },
    { name: "invoiceId", type: "text", label: "Invoice ID" },
    { name: "paymentLink", type: "text", label: "Payment Link" },
    { name: "notes", type: "textarea" },
  ];
}

// No dedicated deal-picker component exists yet — same pragmatic MVP
// call as NIL Deal's athlete picker: a reasonably-sized page of real
// deals, not a search-as-you-type UI beyond today's scope. ADMIN-only
// caller, so this always hits the unscoped admin branch of GET
// /api/nil-deals.
export async function fetchNilDealOptions(): Promise<FieldOption[]> {
  const res = await fetch("/api/nil-deals?pageSize=100");
  if (!res.ok) return [];
  const body = await res.json().catch(() => null);
  const nilDeals = (body?.nilDeals ?? []) as { id: string; dealName: string }[];
  return nilDeals.map((deal) => ({ value: deal.id, label: deal.dealName }));
}

// Same "omit empty values rather than send them" reasoning as every
// other module's payload builder.
export function buildPaymentPayload(
  values: Record<string, unknown>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(values)) {
    if (value === "") continue;
    payload[key] = value;
  }
  return payload;
}
