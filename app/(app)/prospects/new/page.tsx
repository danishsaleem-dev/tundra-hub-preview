import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { ProspectCreateClient } from "./ProspectCreateClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import { ENTITY_LABELS } from "@/lib/labels";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: `New ${ENTITY_LABELS.prospect.singular} — Tundra Sports Hub`,
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function NewProspectPage() {
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // POST /api/prospects (create) is ADMIN-only — a Recruiter has zero
  // create access, matching PROSPECT_ADMIN_ONLY_ACTIONS.
  const body =
    user?.role === "ADMIN" ? (
      <ProspectCreateClient />
    ) : (
      <Panel title={`New ${ENTITY_LABELS.prospect.singular}`}>
        <p className="text-sm text-neutral-text">
          This screen is only available to Admins.
        </p>
      </Panel>
    );

  return (
    <AppShell
      title={`New ${ENTITY_LABELS.prospect.singular}`}
      role={role}
      user={displayUser ?? undefined}
    >
      {body}
    </AppShell>
  );
}
