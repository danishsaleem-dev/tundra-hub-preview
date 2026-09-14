import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { NilDealsListClient } from "./NilDealsListClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import { ENTITY_LABELS } from "@/lib/labels";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: `${ENTITY_LABELS.nilDeal.plural} — Tundra Sports Hub`,
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function NilDealsPage() {
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // GET /api/nil-deals scopes a RECRUITER to deals for their assigned
  // athletes rather than forbidding the list outright, matching Athlete/
  // Prospect's precedent — both roles render the real list client here,
  // even though NAV_ITEMS.recruiter has no menu entry pointing at this
  // page today (a pre-existing nav gap, not something this module's
  // scope covers — the page itself correctly matches the API's real
  // permissions regardless of nav discoverability).
  const body =
    user?.role === "ADMIN" || user?.role === "RECRUITER" ? (
      <NilDealsListClient realRole={user.role} />
    ) : (
      <Panel title={ENTITY_LABELS.nilDeal.plural}>
        <p className="text-sm text-neutral-text">
          This screen is only available to Admins and Recruiters.
        </p>
      </Panel>
    );

  return (
    <AppShell
      title={ENTITY_LABELS.nilDeal.plural}
      role={role}
      user={displayUser ?? undefined}
    >
      {body}
    </AppShell>
  );
}
