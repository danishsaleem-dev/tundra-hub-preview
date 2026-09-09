import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { DevFormTestClient } from "./DevFormTestClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Dev Form Test — Tundra Sports Hub",
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

// Not a real product page — the M5 Day 1 test harness for
// ConfigurableForm, exercising a representative mix of field types
// (including one role-restricted field) before any real module is built
// on top of the shared form system. Reachable by any signed-in role,
// deliberately: the whole point is proving the role-based rendering for
// real, against real Admin/Recruiter/Athlete sessions, not a simulated
// role toggle. Delete once the first real M5 module exists.
export default async function DevFormTestPage() {
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  return (
    <AppShell title="Dev Form Test" defaultRole={role} user={displayUser ?? undefined}>
      {user ? (
        <DevFormTestClient realRole={user.role} />
      ) : (
        <p className="text-sm text-neutral-text">Not signed in.</p>
      )}
    </AppShell>
  );
}
