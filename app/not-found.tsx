"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SearchX } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { NAV_ITEMS, ROLES, type Role } from "@/lib/roles";

function resolveRole(pathname: string): Role {
  for (const role of ROLES) {
    if (NAV_ITEMS[role].some((item) => item.href === pathname)) return role;
  }
  return "admin";
}

function resolveLabel(pathname: string, role: Role): string {
  const match = NAV_ITEMS[role].find((item) => item.href === pathname);
  return match?.label ?? "Not Found";
}

export default function NotFound() {
  const pathname = usePathname();
  const role = resolveRole(pathname);
  const title = resolveLabel(pathname, role);

  return (
    <AppShell title={title} defaultRole={role}>
      <Panel>
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <SearchX className="h-8 w-8 text-neutral-text" />
          <p className="text-lg font-bold text-surface-navy">Page not found</p>
          <p className="max-w-sm text-sm text-neutral-text">
            This page doesn&apos;t exist, or you don&apos;t have access to
            it — either because it hasn&apos;t been built yet, or because
            the record it points to isn&apos;t one you can see.
          </p>
          <Link
            href="/dashboard"
            className="mt-2 rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-blue/90"
          >
            Back to Dashboard
          </Link>
        </div>
      </Panel>
    </AppShell>
  );
}
