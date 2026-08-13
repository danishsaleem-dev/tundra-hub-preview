import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { StatusChip } from "@/components/StatusChip";
import type { StatusVariant } from "@/lib/status";

const ACCENT_BAR: Record<StatusVariant, string> = {
  critical: "bg-critical-text",
  warning: "bg-warning-text",
  success: "bg-success-text",
  neutral: "bg-neutral-text",
};

export interface ListRowTag {
  variant: StatusVariant;
  label: string;
}

export interface ListRowProps {
  title: string;
  meta?: string;
  trailing?: ReactNode;
  accent?: StatusVariant;
  tags?: ListRowTag[];
  className?: string;
}

export function ListRow({
  title,
  meta,
  trailing,
  accent,
  tags,
  className,
}: ListRowProps) {
  return (
    <li
      className={cn(
        "flex items-start gap-2.5 py-2 first:pt-0 last:pb-0",
        className,
      )}
    >
      {accent ? (
        <span
          className={cn(
            "mt-0.5 w-1 shrink-0 self-stretch rounded-full",
            ACCENT_BAR[accent],
          )}
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#0B1330]">
          {title}
        </p>
        {meta ? (
          <p className="mt-0.5 truncate text-xs text-neutral-text">{meta}</p>
        ) : null}
        {tags && tags.length > 0 ? (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <StatusChip
                key={tag.label}
                variant={tag.variant}
                label={tag.label}
              />
            ))}
          </div>
        ) : null}
      </div>
      {trailing ? (
        <div className="flex shrink-0 flex-col items-end gap-1">
          {trailing}
        </div>
      ) : null}
    </li>
  );
}
