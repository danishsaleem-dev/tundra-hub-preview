import { cn } from "@/lib/cn";
import type { StatusVariant } from "@/lib/status";

export type KpiAccent = "brand" | StatusVariant;

const ACCENT_BORDER: Record<KpiAccent, string> = {
  brand: "border-t-brand-blue",
  success: "border-t-success-text",
  warning: "border-t-warning-text",
  critical: "border-t-critical-text",
  neutral: "border-t-neutral-text",
};

const ACCENT_VALUE: Record<KpiAccent, string> = {
  brand: "text-surface-navy",
  success: "text-success-text",
  warning: "text-warning-text",
  critical: "text-critical-text",
  neutral: "text-surface-navy",
};

export interface KpiCardProps {
  label: string;
  value: string;
  subtext?: string;
  accent?: KpiAccent;
  className?: string;
}

export function KpiCard({
  label,
  value,
  subtext,
  accent = "brand",
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-card-tint border-t-[3px] bg-white px-4 py-3.5 shadow-sm",
        ACCENT_BORDER[accent],
        className,
      )}
    >
      <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-text">
        {label}
      </p>
      <p
        className={cn(
          "mt-1.5 text-2xl font-bold tracking-tight",
          ACCENT_VALUE[accent],
        )}
      >
        {value}
      </p>
      {subtext ? (
        <p className="mt-1 text-xs text-neutral-text">{subtext}</p>
      ) : null}
    </div>
  );
}
