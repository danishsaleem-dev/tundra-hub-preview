"use client";

import { useState, type ReactNode } from "react";
import { NavShell } from "@/components/NavShell";
import { TopBar } from "@/components/TopBar";
import type { Role, RoleUser } from "@/lib/roles";

export interface AppShellProps {
  title: string;
  defaultRole: Role;
  /** Real signed-in identity for the sidebar footer. Only shown while
   * viewing this role — switching to preview another role via TopBar falls
   * back to that role's demo placeholder, since showing a real name under a
   * role that isn't actually theirs would be misleading. */
  user?: RoleUser;
  /** Static body, used when the page doesn't vary by role. */
  children?: ReactNode;
  /** Role-keyed body — takes priority over `children` when the page has a distinct view per role. */
  content?: Partial<Record<Role, ReactNode>>;
}

export function AppShell({
  title,
  defaultRole,
  user,
  children,
  content,
}: AppShellProps) {
  const [role, setRole] = useState<Role>(defaultRole);
  const body = content ? (content[role] ?? children) : children;

  return (
    <div className="flex h-screen bg-page-bg">
      <NavShell role={role} user={role === defaultRole ? user : undefined} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={title} role={role} onRoleChange={setRole} />
        <main className="flex-1 overflow-y-auto px-8 py-6">{body}</main>
      </div>
    </div>
  );
}
