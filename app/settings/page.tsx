import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { SettingsShell } from "@/components/settings/SettingsShell";

export const metadata: Metadata = {
  title: "Settings — Tundra Sports Hub",
};

export default function SettingsPage() {
  return (
    <AppShell title="Settings" defaultRole="admin">
      <SettingsShell />
    </AppShell>
  );
}
