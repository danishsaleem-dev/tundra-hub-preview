import { prisma } from "@/lib/prisma";
import { createRestoreHandler } from "@/lib/restore";
import { withRecruiterName } from "@/lib/api/http";
import { ADMIN_ATHLETE_INCLUDE, WITH_RECRUITER } from "@/lib/athlete-select";

export const POST = createRestoreHandler({
  entityType: "ATHLETE",
  // include + withRecruiterName, matching restore()'s result below — a
  // mismatched shape would make sensitiveInfo AND recruiterName/recruiter
  // appear only on one side of the audit diff inside createRestoreHandler
  // and log false "changes" (sensitiveInfo's actual DOB/address/
  // government-ID data among them).
  findById: async (id) => {
    const athlete = await prisma.athlete.findUnique({
      where: { id },
      include: { ...ADMIN_ATHLETE_INCLUDE, ...WITH_RECRUITER },
    });
    return athlete ? withRecruiterName(athlete) : null;
  },
  restore: async (id) =>
    withRecruiterName(
      await prisma.athlete.update({
        where: { id },
        data: { archived: false },
        include: { ...ADMIN_ATHLETE_INCLUDE, ...WITH_RECRUITER },
      }),
    ),
  responseKey: "athlete",
});
