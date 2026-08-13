"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, ROLE_USER, type Role } from "@/lib/roles";

export interface NavShellProps {
  role: Role;
  className?: string;
}

export function NavShell({ role, className }: NavShellProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role];
  const user = ROLE_USER[role];

  return (
    <aside
      className={cn(
        "flex h-full w-64 shrink-0 flex-col bg-surface-navy",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 px-5 py-5">
        <Image
          src="/brand/logo-mark.svg"
          alt=""
          width={32}
          height={32}
          className="shrink-0"
        />
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">Tundra Sports</p>
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
              {item.badge ? (
                <span className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-slate-300">
                  {item.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-3 border-t border-white/10 px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-blue text-xs font-semibold text-white">
          {user.initials}
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs text-slate-400">{user.subtitle}</p>
        </div>
      </div>
    </aside>
  );
}
