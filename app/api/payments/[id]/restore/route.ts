import { prisma } from "@/lib/prisma";
import { createRestoreHandler } from "@/lib/restore";
import { withComputedPaymentFields } from "@/lib/payment-computed";

export const POST = createRestoreHandler({
  entityType: "PAYMENT",
  // Wrapped with withComputedPaymentFields, matching restore()'s result
  // below — otherwise amountOutstanding/isOverdue/collectionRequired/
  // daysSinceInvoiceSent appear only on the "after" side of the audit
  // diff and log as false "changes" on every single restore.
  findById: async (id) => {
    const payment = await prisma.payment.findUnique({ where: { id } });
    // The intersection type withComputedPaymentFields returns doesn't
    // structurally satisfy Record<string, unknown> (no literal index
    // signature) even though every value is a plain string/number/date/
    // boolean at runtime — a type-level quirk, not a real shape mismatch.
    return payment
      ? (withComputedPaymentFields(payment) as unknown as Record<string, unknown> & { id: string })
      : null;
  },
  restore: async (id) =>
    withComputedPaymentFields(
      await prisma.payment.update({ where: { id }, data: { archived: false } }),
    ),
  responseKey: "payment",
});
