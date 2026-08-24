import "server-only";
import type { Payment } from "@prisma/client";

export interface PaymentComputed {
  // String, not number — matches how Prisma serializes the Decimal fields
  // it's derived from (paymentAmount/amountPaid come back as decimal
  // strings like "150.00" in the JSON response), so this stays consistent
  // with its own inputs rather than silently becoming a float.
  amountOutstanding: string;
  isOverdue: boolean;
  collectionRequired: boolean;
  daysSinceInvoiceSent: number | null;
}

// The one place these four values are computed — every route that returns
// a Payment (list, get-one, create, update, archive) runs its result
// through this, so there's a single formula per field, not four separate
// ad hoc checks scattered across route handlers.
export function withComputedPaymentFields<T extends Payment>(
  payment: T,
): T & PaymentComputed {
  const now = new Date();

  const amountOutstanding = payment.paymentAmount.minus(payment.amountPaid).toFixed(2);

  const isOverdue =
    payment.status !== "PAID" &&
    payment.dueDate !== null &&
    payment.dueDate.getTime() < now.getTime();

  const collectionRequired = payment.status !== "PAID" && payment.invoiceSent === true;

  const daysSinceInvoiceSent =
    payment.invoiceSentDate === null
      ? null
      : Math.floor(
          (now.getTime() - payment.invoiceSentDate.getTime()) / (1000 * 60 * 60 * 24),
        );

  return { ...payment, amountOutstanding, isOverdue, collectionRequired, daysSinceInvoiceSent };
}

export function withComputedPaymentFieldsList<T extends Payment>(payments: T[]) {
  return payments.map(withComputedPaymentFields);
}
