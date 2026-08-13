"use client";

import { useState, type ReactNode } from "react";
import { NavShell } from "@/components/NavShell";
import { TopBar } from "@/components/TopBar";
import type { Role } from "@/lib/roles";

export interface AppShellProps {
  title: string;
  defaultRole: Role;
  children: ReactNode;
}

export function AppShell({ title, defaultRole, children }: AppShellProps) {
  const [role, setRole] = useState<Role>(defaultRole);

  return (
    <div className="flex h-screen bg-page-bg">
      <NavShell role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} role={role} onRoleChange={setRole} />
        <main className="flex-1 overflow-y-auto px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
