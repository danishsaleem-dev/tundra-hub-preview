import { prisma } from "@/lib/prisma";
import { createRestoreHandler } from "@/lib/restore";

export const POST = createRestoreHandler({
  findById: (id) => prisma.nilDeal.findUnique({ where: { id } }),
  restore: (id) =>
    prisma.nilDeal.update({
      where: { id },
      data: { archived: false },
      include: { payments: true },
    }),
  responseKey: "nilDeal",
});
