"use client";

import { useState } from "react";
import { Bell, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { ROLES, ROLE_LABEL, type Role } from "@/lib/roles";

export interface TopBarProps {
  title: string;
  role: Role;
  onRoleChange: (role: Role) => void;
  hasNotifications?: boolean;
}

export function TopBar({
  title,
  role,
  onRoleChange,
  hasNotifications = true,
}: TopBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-card-tint bg-white px-8">
      <h1 className="text-lg font-bold text-[#0B1330]">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex items-center gap-2 rounded-full border border-card-tint px-3 py-1.5 text-sm font-medium text-[#0B1330] transition-colors hover:bg-page-bg"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
            {ROLE_LABEL[role]}
            <ChevronDown className="h-3.5 w-3.5 text-neutral-text" />
          </button>

          {open ? (
            <>
              <button
                type="button"
                aria-label="Close role menu"
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-lg border border-card-tint bg-white py-1 shadow-lg">
                {ROLES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onRoleChange(option);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-page-bg",
                      option === role
                        ? "font-semibold text-brand-blue"
                        : "text-[#0B1330]",
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-blue" />
                    {ROLE_LABEL[option]}
                  </button>
                ))}
              </div>
            </>
          ) : null}
        </div>

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
