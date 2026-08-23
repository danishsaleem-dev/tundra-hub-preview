import "server-only";
import { Prisma } from "@prisma/client";
import type { ProspectWritableInput } from "@/lib/validation/prospect";

// Same Prisma.JsonNull bridging as toAthletePrismaData — Prisma rejects a
// bare `null` for a nullable JSON column, zod's output uses plain `null`.
export function toProspectPrismaData(
  data: Partial<ProspectWritableInput>,
): Prisma.ProspectUncheckedCreateInput & Prisma.ProspectUncheckedUpdateInput {
  return {
    ...data,
    socialLinks: data.socialLinks === null ? Prisma.JsonNull : data.socialLinks,
  } as Prisma.ProspectUncheckedCreateInput & Prisma.ProspectUncheckedUpdateInput;
}
