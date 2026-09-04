import { prisma } from "@/lib/prisma";
import { createRestoreHandler } from "@/lib/restore";
import { ADMIN_ATHLETE_INCLUDE } from "@/lib/athlete-select";

export const POST = createRestoreHandler({
  findById: (id) => prisma.athlete.findUnique({ where: { id } }),
  restore: (id) =>
    prisma.athlete.update({
      where: { id },
      data: { archived: false },
      include: ADMIN_ATHLETE_INCLUDE,
    }),
  responseKey: "athlete",
});
