import { prisma } from "@/lib/prisma";
import { createRestoreHandler } from "@/lib/restore";
import { withComputedPaymentFields } from "@/lib/payment-computed";

export const POST = createRestoreHandler({
  entityType: "PAYMENT",
  findById: (id) => prisma.payment.findUnique({ where: { id } }),
  restore: async (id) =>
    withComputedPaymentFields(
      await prisma.payment.update({ where: { id }, data: { archived: false } }),
    ),
  responseKey: "payment",
});
