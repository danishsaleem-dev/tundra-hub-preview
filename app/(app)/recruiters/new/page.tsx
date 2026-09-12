import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { RecruiterCreateClient } from "./RecruiterCreateClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import { ENTITY_LABELS } from "@/lib/labels";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: `New ${ENTITY_LABELS.recruiter.singular} — Tundra Sports Hub`,
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function NewRecruiterPage() {
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // POST /api/recruiters (create) is ADMIN-only — same real-role gate as
  // the list page.
  const body =
    user?.role === "ADMIN" ? (
      <RecruiterCreateClient />
    ) : (
      <Panel title={`New ${ENTITY_LABELS.recruiter.singular}`}>
        <p className="text-sm text-neutral-text">
          This screen is only available to Admins.
        </p>
      </Panel>
    );

  return (
    <AppShell
      title={`New ${ENTITY_LABELS.recruiter.singular}`}
      defaultRole={role}
      user={displayUser ?? undefined}
    >
      {body}
    </AppShell>
  );
}
