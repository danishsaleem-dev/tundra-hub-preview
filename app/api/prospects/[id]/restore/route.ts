import { prisma } from "@/lib/prisma";
import { createRestoreHandler } from "@/lib/restore";

export const POST = createRestoreHandler({
  findById: (id) => prisma.prospect.findUnique({ where: { id } }),
  restore: (id) =>
    prisma.prospect.update({ where: { id }, data: { archived: false } }),
  responseKey: "prospect",
});
