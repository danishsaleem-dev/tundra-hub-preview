"use client";

import { useState, type ComponentType } from "react";
import {
  CircleUser,
  Lock,
  Bell,
  Shield,
  Users,
  CircleHelp,
} from "lucide-react";
import { SettingsNav, type SettingsNavItem } from "@/components/settings/SettingsNav";
import { ProfilePanel } from "@/components/settings/ProfilePanel";
import { SecurityPanel } from "@/components/settings/SecurityPanel";
import { NotificationsPanel } from "@/components/settings/NotificationsPanel";
import { AccessPanel } from "@/components/settings/AccessPanel";
import { TeamPanel } from "@/components/settings/TeamPanel";
import { HelpPanel } from "@/components/settings/HelpPanel";

const NAV_ITEMS: SettingsNavItem[] = [
  { key: "profile", label: "Profile", icon: CircleUser },
  { key: "security", label: "Account & Security", icon: Lock },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "access", label: "Access & Roles", icon: Shield },
  { key: "team", label: "Team", icon: Users },
  { key: "help", label: "Help", icon: CircleHelp },
];

const PANELS: Record<string, ComponentType> = {
  profile: ProfilePanel,
  security: SecurityPanel,
  notifications: NotificationsPanel,
  access: AccessPanel,
  team: TeamPanel,
  help: HelpPanel,
};

export function SettingsShell() {
  const [active, setActive] = useState("profile");
  const ActivePanel = PANELS[active] ?? ProfilePanel;

  return (
    <div>
      <div>
        <h1 className="text-2xl font-bold text-surface-navy">Settings</h1>
        <p className="mt-1 text-sm text-neutral-text">
          Manage your account and preferences
        </p>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[224px_1fr]">
        <SettingsNav items={NAV_ITEMS} active={active} onSelect={setActive} />
        <ActivePanel />
      </div>
    </div>
  );
}
