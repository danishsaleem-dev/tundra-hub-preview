"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, ROLE_USER, type Role, type RoleUser } from "@/lib/roles";

export interface NavShellProps {
  role: Role;
  /** Real signed-in identity, when known. Falls back to the role's demo
   * placeholder (e.g. on /style-guide, or when previewing another role). */
  user?: RoleUser;
  className?: string;
}

export function NavShell({ role, user: userOverride, className }: NavShellProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];
  const user = userOverride ?? ROLE_USER[role];

  return (
    <aside
      className={cn(
        "flex h-full w-56 shrink-0 flex-col bg-surface-navy",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Image
          src="/brand/tundra-icon-mark.png"
          alt=""
          width={32}
          height={32}
          className="shrink-0"
        />
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">Tundra Sports Group</p>
          <p className="text-[10px] font-medium tracking-wide text-slate-400">
            HUB
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {items.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-blue text-white"
                  : "text-slate-300 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {item.badge ? <Badge label={item.badge} tone="dark" /> : null}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
        <Avatar name={user.name} initials={user.initials} />
        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs text-slate-400">{user.subtitle}</p>
        </div>
        {/* Only the real signed-in user (userOverride set) gets a sign-out
         * control — style-guide demos and role-preview placeholders have no
         * session to sign out of. */}
        {userOverride ? (
          <SignOutButton>
            <button
              type="button"
              aria-label="Sign out"
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </SignOutButton>
        ) : null}
      </div>
    </aside>
  );
}
