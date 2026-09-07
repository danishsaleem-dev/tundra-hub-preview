import { prisma } from "@/lib/prisma";
import { createRestoreHandler } from "@/lib/restore";

export const POST = createRestoreHandler({
  entityType: "NIL_DEAL",
  // include, matching restore()'s result below — otherwise `payments`
  // appears only on the "after" side of the audit diff and logs the
  // deal's full payment history as a false "change".
  findById: (id) =>
    prisma.nilDeal.findUnique({ where: { id }, include: { payments: true } }),
  restore: (id) =>
    prisma.nilDeal.update({
      where: { id },
      data: { archived: false },
      include: { payments: true },
    }),
  responseKey: "nilDeal",
});
