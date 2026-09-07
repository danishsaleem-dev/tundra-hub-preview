import { prisma } from "@/lib/prisma";
import { createRestoreHandler } from "@/lib/restore";
import { ADMIN_ATHLETE_INCLUDE } from "@/lib/athlete-select";

export const POST = createRestoreHandler({
  entityType: "ATHLETE",
  // include, matching restore()'s result below — a plain findUnique here
  // would make sensitiveInfo appear only on the "after" side of the audit
  // diff inside createRestoreHandler and log the athlete's actual
  // DOB/address/government-ID data as a false "change".
  findById: (id) =>
    prisma.athlete.findUnique({ where: { id }, include: ADMIN_ATHLETE_INCLUDE }),
  restore: (id) =>
    prisma.athlete.update({
      where: { id },
      data: { archived: false },
      include: ADMIN_ATHLETE_INCLUDE,
    }),
  responseKey: "athlete",
});
