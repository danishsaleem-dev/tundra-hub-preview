"use client";

import { useState, type ReactNode } from "react";
import { NavShell } from "@/components/NavShell";
import { TopBar } from "@/components/TopBar";
import type { Role, RoleUser } from "@/lib/roles";

export interface AppShellProps {
  title: string;
  /** The real signed-in user's actual role — the only source of truth for
   * which nav items and dashboard content render. There is no client-side
   * way to view this as any other role; a page that wants to show
   * something different must be signed in as something different. */
  role: Role;
  /** Real signed-in identity for the sidebar footer. */
  user?: RoleUser;
  children: ReactNode;
}

export function AppShell({ title, role, user, children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="flex h-screen bg-page-bg">
      <NavShell
        role={role}
        user={user}
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          title={title}
          role={role}
          onMenuClick={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-8 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
