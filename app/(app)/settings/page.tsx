import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { SettingsShell } from "@/components/settings/SettingsShell";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Settings — Tundra Sports Hub",
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function SettingsPage() {
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  return (
    <AppShell
      title="Settings"
      defaultRole={role}
      user={displayUser ?? undefined}
    >
      <SettingsShell />
    </AppShell>
  );
}
