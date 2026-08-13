import { cn } from "@/lib/cn";

export interface BadgeProps {
  label: string;
  tone?: "dark" | "light";
  className?: string;
}

export function Badge({ label, tone = "light", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "rounded border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide",
        tone === "dark"
          ? "border-white/20 text-slate-300"
          : "border-card-tint text-neutral-text",
        className,
      )}
    >
      {label}
    </span>
  );
}
