import { prisma } from "@/lib/prisma";
import { createRestoreHandler } from "@/lib/restore";
import { withRecruiterName } from "@/lib/api/http";

const WITH_RECRUITER = { recruiter: { select: { name: true } } };

export const POST = createRestoreHandler({
  entityType: "PROSPECT",
  // include + withRecruiterName, matching restore()'s result below — a
  // mismatched shape would make recruiter/recruiterName appear only on
  // one side of the audit diff inside createRestoreHandler and log a
  // false "change" on every single restore.
  findById: async (id) => {
    const prospect = await prisma.prospect.findUnique({
      where: { id },
      include: WITH_RECRUITER,
    });
    return prospect ? withRecruiterName(prospect) : null;
  },
  restore: async (id) =>
    withRecruiterName(
      await prisma.prospect.update({
        where: { id },
        data: { archived: false },
        include: WITH_RECRUITER,
      }),
    ),
  responseKey: "prospect",
});
