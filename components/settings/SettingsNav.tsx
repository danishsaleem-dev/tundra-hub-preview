import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SettingsNavItem {
  key: string;
  label: string;
  icon: LucideIcon;
}

export interface SettingsNavProps {
  items: SettingsNavItem[];
  active: string;
  onSelect: (key: string) => void;
  className?: string;
}

export function SettingsNav({
  items,
  active,
  onSelect,
  className,
}: SettingsNavProps) {
  return (
    <nav
      className={cn(
        "space-y-0.5 rounded-xl border border-card-tint bg-white p-2",
        className,
      )}
    >
      {items.map((item) => {
        const isActive = item.key === active;
        const Icon = item.icon;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg border-l-2 px-3 py-2 text-left text-sm font-medium transition-colors",
              isActive
                ? "border-l-brand-blue bg-brand-blue/10 text-brand-blue"
                : "border-l-transparent text-neutral-text hover:bg-page-bg",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
