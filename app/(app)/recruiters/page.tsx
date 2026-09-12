import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { RecruitersListClient } from "./RecruitersListClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import { ENTITY_LABELS } from "@/lib/labels";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: `${ENTITY_LABELS.recruiter.plural} — Tundra Sports Hub`,
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function RecruitersPage() {
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // GET /api/recruiters (the list route) is ADMIN-only — a RECRUITER can
  // only ever reach their own record via /recruiters/[id], never browse
  // the roster. Mirrors the same real-role gate dashboard/page.tsx uses
  // for its admin-only data.
  const body =
    user?.role === "ADMIN" ? (
      <RecruitersListClient realRole={user.role} />
    ) : (
      <Panel title={ENTITY_LABELS.recruiter.plural}>
        <p className="text-sm text-neutral-text">
          This screen is only available to Admins.
        </p>
      </Panel>
    );

  return (
    <AppShell
      title={ENTITY_LABELS.recruiter.plural}
      role={role}
      user={displayUser ?? undefined}
    >
      {body}
    </AppShell>
  );
}
