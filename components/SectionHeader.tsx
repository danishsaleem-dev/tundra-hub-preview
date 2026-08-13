import type { LucideIcon } from "lucide-react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import type { StatusVariant } from "@/lib/status";

const ACCENT_TEXT: Record<StatusVariant, string> = {
  critical: "text-critical-text",
  warning: "text-warning-text",
  success: "text-success-text",
  neutral: "text-neutral-text",
};

const ACCENT_BORDER: Record<StatusVariant, string> = {
  critical: "border-l-critical-text",
  warning: "border-l-warning-text",
  success: "border-l-success-text",
  neutral: "border-l-neutral-text",
};

export interface SectionHeaderProps {
  label: string;
  count?: number;
  accent?: StatusVariant;
  icon?: LucideIcon;
  collapsible?: boolean;
  className?: string;
}

export function SectionHeader({
  label,
  count,
  accent = "neutral",
  icon: Icon,
  collapsible = false,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-l-4 py-1 pl-3",
        ACCENT_BORDER[accent],
        className,
      )}
    >
      {Icon ? <Icon className={cn("h-3.5 w-3.5", ACCENT_TEXT[accent])} /> : null}
      <span
        className={cn(
          "text-xs font-bold uppercase tracking-wide",
          ACCENT_TEXT[accent],
        )}
      >
        {label}
        {count !== undefined ? ` (${count})` : ""}
      </span>
      {collapsible ? (
        <ChevronDown className="h-3.5 w-3.5 text-neutral-text" />
      ) : null}
    </div>
  );
}
