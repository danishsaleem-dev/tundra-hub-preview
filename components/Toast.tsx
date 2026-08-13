import type { ReactNode } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";
import type { StatusVariant } from "@/lib/status";

const VARIANT_STYLES: Record<
  StatusVariant,
  { icon: typeof CheckCircle2; border: string; icon_color: string }
> = {
  success: {
    icon: CheckCircle2,
    border: "border-l-success-text",
    icon_color: "text-success-text",
  },
  warning: {
    icon: AlertTriangle,
    border: "border-l-warning-text",
    icon_color: "text-warning-text",
  },
  critical: {
    icon: XCircle,
    border: "border-l-critical-text",
    icon_color: "text-critical-text",
  },
  neutral: {
    icon: Info,
    border: "border-l-neutral-text",
    icon_color: "text-neutral-text",
  },
};

export interface ToastProps {
  variant: StatusVariant;
  message: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Toast({ variant, message, onClose, className }: ToastProps) {
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "flex w-80 items-start gap-2.5 rounded-lg border-l-4 bg-white px-4 py-3 shadow-lg ring-1 ring-black/5",
        styles.border,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", styles.icon_color)} />
      <p className="flex-1 text-sm leading-snug text-[#0B1330]">{message}</p>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss"
          className="shrink-0 text-neutral-text transition-colors hover:text-[#0B1330]"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      ) : null}
    </div>
  );
}
