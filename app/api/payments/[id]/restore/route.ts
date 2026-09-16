import { prisma } from "@/lib/prisma";
import { createRestoreHandler } from "@/lib/restore";
import { withComputedPaymentFields } from "@/lib/payment-computed";
import { withDealName } from "@/lib/api/http";

const WITH_DEAL = { nilDeal: { select: { dealName: true } } };

export const POST = createRestoreHandler({
  entityType: "PAYMENT",
  // Wrapped with withDealName(withComputedPaymentFields(...)), matching
  // restore()'s result below — otherwise amountOutstanding/isOverdue/
  // collectionRequired/daysSinceInvoiceSent/dealName appear only on the
  // "after" side of the audit diff and log as false "changes" on every
  // single restore.
  findById: async (id) => {
    const payment = await prisma.payment.findUnique({ where: { id }, include: WITH_DEAL });
    // The intersection type withComputedPaymentFields/withDealName return
    // doesn't structurally satisfy Record<string, unknown> (no literal
    // index signature) even though every value is a plain string/number/
    // date/boolean at runtime — a type-level quirk, not a real shape
    // mismatch.
    return payment
      ? (withDealName(withComputedPaymentFields(payment)) as unknown as Record<string, unknown> & {
          id: string;
        })
      : null;
  },
  restore: async (id) =>
    withDealName(
      withComputedPaymentFields(
        await prisma.payment.update({
          where: { id },
          data: { archived: false },
          include: WITH_DEAL,
        }),
      ),
    ),
  responseKey: "payment",
});
