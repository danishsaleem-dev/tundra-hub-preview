"use client";

import { Bell, Menu } from "lucide-react";

export interface TopBarProps {
  title: string;
  /** Opens the off-canvas mobile nav drawer — the button only renders
   * below the md breakpoint, matching NavShell's own breakpoint. */
  onMenuClick?: () => void;
  hasNotifications?: boolean;
}

export function TopBar({
  title,
  onMenuClick,
  hasNotifications = true,
}: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-card-tint bg-white px-4 sm:px-8">
      <div className="flex min-w-0 items-center gap-3">
        {onMenuClick ? (
          <button
            type="button"
            aria-label="Open menu"
            onClick={onMenuClick}
            className="shrink-0 text-surface-navy md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}
        <h1 className="truncate text-lg font-bold text-surface-navy">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-neutral-text transition-colors hover:bg-page-bg"
        >
          <Bell className="h-4 w-4" />
          {hasNotifications ? (
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-critical-text" />
          ) : null}
        </button>
      </div>
    </header>
  );
}
