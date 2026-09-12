import Link from "next/link";
import { SearchX } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import type { Role } from "@/lib/roles";

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

// A real server component, not a client-side pathname guess — the nav
// sidebar and identity shown here come from the real signed-in session,
// same as every other page, not a heuristic match against the URL.
export default async function NotFound() {
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  return (
    <AppShell title="Page Not Found" role={role} user={displayUser ?? undefined}>
      <Panel>
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <SearchX className="h-8 w-8 text-neutral-text" />
          <p className="text-lg font-bold text-surface-navy">Page not found</p>
          <p className="max-w-sm text-sm text-neutral-text">
            This page doesn&apos;t exist, or you don&apos;t have access to
            it — either because it hasn&apos;t been built yet, or because
            the record it points to isn&apos;t one you can see.
          </p>
          <Link
            href="/dashboard"
            className="mt-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90"
          >
            Back to Dashboard
          </Link>
        </div>
      </Panel>
    </AppShell>
  );
}
