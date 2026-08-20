import type { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { NoAccountFound } from "@/components/NoAccountFound";

// Runs before every route under this group renders. proxy.ts already
// guarantees a signed-in Clerk session got this far — this layer answers
// the next question: does that Clerk account map to a real User row in
// Postgres? If not, that's an error state (the invite flow that would
// have created one doesn't exist yet), not something to paper over.
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
    return <NoAccountFound email={email} />;
  }

  return <>{children}</>;
}
