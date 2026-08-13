import { cn } from "@/lib/cn";
import { STATUS_STYLES, type StatusVariant } from "@/lib/status";

export interface StatusChipProps {
  label: string;
  variant: StatusVariant;
  className?: string;
}

export function StatusChip({ label, variant, className }: StatusChipProps) {
  const styles = STATUS_STYLES[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full border border-current/20 px-2.5 py-0.5 text-xs font-medium",
        styles.bg,
        styles.text,
        className,
      )}
    >
      {label}
    </span>
  );
}
