import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

export interface PanelProps {
  title?: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  tone?: "default" | "dark";
  children: ReactNode;
  className?: string;
}

export function Panel({
  title,
  description,
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
        "rounded-xl p-4",
        isDark
          ? "bg-surface-navy-deep text-white"
          : "border border-card-tint bg-white shadow-sm",
        className,
      )}
    >
      {title ? (
        <div
          className={cn(
            "flex items-start justify-between gap-3",
            description ? "border-b border-card-tint pb-3" : undefined,
          )}
        >
          <div>
            <div className="flex items-center gap-1.5">
              {Icon ? (
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
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
            {description ? (
              <p className="mt-1 text-xs text-neutral-text">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={cn(title ? "mt-3" : undefined)}>{children}</div>
    </div>
  );
}
