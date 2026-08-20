import "server-only";
import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import type { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { RoleUser } from "@/lib/roles";

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

// Shapes the resolved identity for display (NavShell's user footer, etc.).
// Postgres doesn't store a name -- that lives on the Clerk account -- so this
// combines both sources. Separate from getCurrentUser() so pages that only
// need role/id/email for logic don't pay for a Clerk profile fetch too.
export const getCurrentDisplayUser = cache(
  async (): Promise<RoleUser | null> => {
    const user = await getCurrentUser();
    if (!user) return null;

    const clerkUser = await currentUser();
    const firstName = clerkUser?.firstName ?? "";
    const lastName = clerkUser?.lastName ?? "";
    const fullName = `${firstName} ${lastName}`.trim();
    const name = fullName || user.email;
    const initials = fullName
      ? `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
      : user.email.slice(0, 2).toUpperCase();
    const subtitle =
      user.role.charAt(0) + user.role.slice(1).toLowerCase();

    return { name, initials, subtitle };
  },
);
