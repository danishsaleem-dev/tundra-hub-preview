import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/cn";
import type { StatusVariant } from "@/lib/status";

const VARIANT_STYLES: Record<
  StatusVariant,
  { bg: string; border: string; icon: string }
> = {
  critical: {
    bg: "bg-critical-bg",
    border: "border-l-critical-text",
    icon: "text-critical-text",
  },
  warning: {
    bg: "bg-warning-bg",
    border: "border-l-warning-text",
    icon: "text-warning-text",
  },
  success: {
    bg: "bg-success-bg",
    border: "border-l-success-text",
    icon: "text-success-text",
  },
  neutral: {
    bg: "bg-neutral-bg",
    border: "border-l-neutral-text",
    icon: "text-neutral-text",
  },
};

const DEFAULT_ICON: Record<StatusVariant, typeof AlertTriangle> = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  success: CheckCircle2,
  neutral: Info,
};

export interface AlertBannerProps {
  variant: StatusVariant;
  message: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function AlertBanner({
  variant,
  message,
  action,
  className,
}: AlertBannerProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = DEFAULT_ICON[variant];

  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border-l-4 px-3.5 py-2.5",
        styles.bg,
        styles.border,
        className,
      )}
    >
      <Icon className={cn("h-3.5 w-3.5 shrink-0", styles.icon)} />
      <p className="flex-1 text-sm leading-snug text-[#0B1330]">{message}</p>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
