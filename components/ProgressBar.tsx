import { cn } from "@/lib/cn";

export interface ProgressBarProps {
  label: string;
  subtext?: string;
  percent: number;
  className?: string;
}

export function ProgressBar({
  label,
  subtext,
  percent,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-[#0B1330]">{label}</span>
        {subtext ? (
          <span className="text-xs text-neutral-text">{subtext}</span>
        ) : null}
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-card-tint">
        <div
          className="h-full rounded-full bg-brand-blue"
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
