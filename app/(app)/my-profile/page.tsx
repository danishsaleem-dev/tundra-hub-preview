import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { MyProfileForm } from "@/components/MyProfileForm";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import { ENTITY_LABELS } from "@/lib/labels";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: "My Profile — Tundra Sports Hub",
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function MyProfilePage() {
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // This page only ever renders real data for a real ATHLETE session with
  // a linked record — reachable by anyone previewing the athlete nav via
  // the role switcher (AppShell), so a non-athlete viewer gets a plain
  // notice instead of the form attempting to fetch data their account
  // has no athleteId to fetch.
  const body =
    user?.role === "ATHLETE" && user.athleteId ? (
      <MyProfileForm athleteId={user.athleteId} />
    ) : (
      <Panel title={`${ENTITY_LABELS.athlete.singular} Profile`}>
        <p className="text-sm text-neutral-text">
          This screen is only available when signed in as an{" "}
          {ENTITY_LABELS.athlete.singular}.
        </p>
      </Panel>
    );

  return (
    <AppShell title="My Profile" defaultRole={role} user={displayUser ?? undefined}>
      {body}
    </AppShell>
  );
}
