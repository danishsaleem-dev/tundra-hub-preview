import "server-only";
import { cache } from "react";
import { auth } from "@clerk/nextjs/server";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface CurrentUser {
  id: string;
  clerkUserId: string;
  role: UserRole;
  email: string;
  athleteId: string | null;
  recruiterId: string | null;
}

// Looks up the Postgres User row for the signed-in Clerk session. Does NOT
// create one if missing — a missing row means the invite flow (not built
// yet) never ran for this account, and that's an error state to surface,
// not something to paper over by inventing a row.
//
// Wrapped in React's cache() so every call within the same request reuses
// the same lookup instead of hitting the database again — the (app) layout
// calls this once to gate the route, and any page below it can call it
// again for free.
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const { userId } = await auth();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { clerkUserId: userId },
    select: {
      id: true,
      clerkUserId: true,
      role: true,
      email: true,
      athleteId: true,
      recruiterId: true,
    },
  });
});
