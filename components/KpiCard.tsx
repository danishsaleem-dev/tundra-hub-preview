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
        "rounded-xl border border-card-tint border-t-[3px] bg-white px-5 py-4 shadow-sm",
        ACCENT_BORDER[accent],
        className,
      )}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-neutral-text">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-[#0B1330]">
        {value}
      </p>
      {subtext ? (
        <p className="mt-1 text-sm text-neutral-text">{subtext}</p>
      ) : null}
    </div>
  );
}
