import { prisma } from "@/lib/prisma";
import { createRestoreHandler } from "@/lib/restore";

export const POST = createRestoreHandler({
  entityType: "RECRUITER",
  findById: (id) => prisma.recruiter.findUnique({ where: { id } }),
  restore: (id) =>
    prisma.recruiter.update({ where: { id }, data: { archived: false } }),
  responseKey: "recruiter",
});
