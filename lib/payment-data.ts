import "server-only";
import type { PaymentWritableInput } from "@/lib/validation/payment";

// Auto-stamps invoiceSentDate to now() when invoiceSent is flipping from
// false to true and no explicit date was provided in this request — pure
// data-integrity, not new automation: without this, daysSinceInvoiceSent
// silently comes back null (or wrong) whenever someone flips the boolean
// and forgets the date. Never re-stamps if invoiceSent was already true
// (previousInvoiceSent), and never overrides an explicitly-provided date.
export function applyInvoiceSentAutoStamp(
  data: Partial<PaymentWritableInput>,
  previousInvoiceSent: boolean,
): Partial<PaymentWritableInput> {
  const flippingToSent = previousInvoiceSent === false && data.invoiceSent === true;
  if (flippingToSent && data.invoiceSentDate === undefined) {
    return { ...data, invoiceSentDate: new Date() };
  }
  return data;
}
