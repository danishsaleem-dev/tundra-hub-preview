import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PanelProps {
  title?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  tone?: "default" | "dark";
  children: ReactNode;
  className?: string;
}

export function Panel({
  title,
  icon: Icon,
  action,
  tone = "default",
  children,
  className,
}: PanelProps) {
  const isDark = tone === "dark";

  return (
    <div
      className={cn(
        "rounded-xl p-5",
        isDark
          ? "bg-surface-navy-deep text-white"
          : "border border-card-tint bg-white shadow-sm",
        className,
      )}
    >
      {title ? (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {Icon ? (
              <Icon
                className={cn(
                  "h-4 w-4",
                  isDark ? "text-brand-blue" : "text-neutral-text",
                )}
              />
            ) : null}
            <h3
              className={cn(
                "text-sm font-bold",
                isDark ? "text-white" : "text-[#0B1330]",
              )}
            >
              {title}
            </h3>
          </div>
          {action}
        </div>
      ) : null}
      <div className={cn(title ? "mt-4" : undefined)}>{children}</div>
    </div>
  );
}
