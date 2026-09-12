import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { ProspectsListClient } from "./ProspectsListClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import { ENTITY_LABELS } from "@/lib/labels";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: `${ENTITY_LABELS.prospect.plural} — Tundra Sports Hub`,
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function ProspectsPage() {
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // Unlike Recruiters (ADMIN-only list), GET /api/prospects scopes a
  // RECRUITER to their own assigned prospects rather than forbidding the
  // list outright — so both roles render the real list client here.
  const body =
    user?.role === "ADMIN" || user?.role === "RECRUITER" ? (
      <ProspectsListClient realRole={user.role} />
    ) : (
      <Panel title={ENTITY_LABELS.prospect.plural}>
        <p className="text-sm text-neutral-text">
          This screen is only available to Admins and Recruiters.
        </p>
      </Panel>
    );

  return (
    <AppShell
      title={ENTITY_LABELS.prospect.plural}
      role={role}
      user={displayUser ?? undefined}
    >
      {body}
    </AppShell>
  );
}
