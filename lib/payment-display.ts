// Pure display-mapping only — deliberately NOT "server-only" (unlike
// lib/payment-computed.ts), since this is consumed by client components
// (the dashboard's Payment Health widget, the NIL Deal detail page's
// linked-payments section) that render the chip it returns. The values
// it reads (isOverdue, status) are themselves computed once, server-side,
// by withComputedPaymentFields — this is only the one place that maps
// those values to a StatusChip variant/label, so every payment list in
// the app renders the same chip for the same payment, not four separately
// maintained copies of this same if/else chain.
import type { StatusVariant } from "@/lib/status";
import type { PaymentStatus } from "@prisma/client";

export interface PaymentChipInput {
  status: PaymentStatus;
  isOverdue: boolean;
}

// Overdue always wins regardless of the stored status — an overdue
// PARTIAL payment is still, first and foremost, overdue.
export function paymentStatusChip(payment: PaymentChipInput): {
  variant: StatusVariant;
  label: string;
} {
  if (payment.isOverdue) return { variant: "critical", label: "Overdue" };
  if (payment.status === "PAID") return { variant: "success", label: "Paid" };
  if (payment.status === "PARTIAL") return { variant: "warning", label: "Partial" };
  return { variant: "neutral", label: "Pending" };
}
