import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { DevListDetailTestClient } from "./DevListDetailTestClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Dev List/Detail Test — Tundra Sports Hub",
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

// Not a real product page — the M5 Day 2 test harness for
// ConfigurableList and ConfigurableDetail (plus the edit action bridging
// into yesterday's ConfigurableForm), exercising a representative mix of
// column/field types including one role-restricted field, before any
// real module is built on top of the shared systems. Reachable by any
// signed-in role, deliberately, same reasoning as dev-form-test. Delete
// alongside dev-form-test once the first real M5 module exists.
export default async function DevListDetailTestPage() {
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  return (
    <AppShell
      title="Dev List/Detail Test"
      defaultRole={role}
      user={displayUser ?? undefined}
    >
      {user ? (
        <DevListDetailTestClient realRole={user.role} />
      ) : (
        <p className="text-sm text-neutral-text">Not signed in.</p>
      )}
    </AppShell>
  );
}
