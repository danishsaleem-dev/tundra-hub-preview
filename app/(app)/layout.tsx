import type { ReactNode } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { NoAccountFound } from "@/components/NoAccountFound";

// Runs before every route under this group renders. proxy.ts already
// guarantees a signed-in Clerk session got this far — this layer answers
// the next question: does that Clerk account map to a real User row in
// Postgres?
//
// If not, there are two different situations, and they need different
// copy: a truly uninvited sign-in (real error, tell them to contact an
// admin) vs. someone who just accepted a real invitation seconds ago and is
// waiting on the user.created webhook to create their row (temporary,
// tell them to retry). Clerk sets publicMetadata on the account itself at
// signup time as part of accepting the invite — that happens synchronously
// in Clerk's own flow, independent of whether our webhook has run yet — so
// its presence is what distinguishes "invited" from "never invited" even
// before the webhook lands.
export default async function AppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    const clerkUser = await currentUser();
    const email = clerkUser?.primaryEmailAddress?.emailAddress ?? null;
    const pending = Boolean(clerkUser?.publicMetadata?.role);
    return <NoAccountFound email={email} pending={pending} />;
  }

  return <>{children}</>;
}
