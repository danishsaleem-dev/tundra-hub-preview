import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { AthletesListClient } from "./AthletesListClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import { ENTITY_LABELS } from "@/lib/labels";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: `${ENTITY_LABELS.athlete.plural} — Tundra Sports Hub`,
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function AthletesPage() {
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // GET /api/athletes scopes a RECRUITER to their own assigned athletes
  // rather than forbidding the list outright (unlike Recruiter's list,
  // which is ADMIN-only) — so both roles render the real list client
  // here. An ATHLETE has no list access at all (matches the API's own
  // 403 for that role) and keeps using /my-profile.
  const body =
    user?.role === "ADMIN" || user?.role === "RECRUITER" ? (
      <AthletesListClient realRole={user.role} />
    ) : (
      <Panel title={ENTITY_LABELS.athlete.plural}>
        <p className="text-sm text-neutral-text">
          This screen is only available to Admins and Recruiters.
        </p>
      </Panel>
    );

  return (
    <AppShell
      title={ENTITY_LABELS.athlete.plural}
      role={role}
      user={displayUser ?? undefined}
    >
      {body}
    </AppShell>
  );
}
