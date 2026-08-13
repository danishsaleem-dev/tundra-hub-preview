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
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tracking-wide",
        tone === "dark"
          ? "border-white/15 bg-white/10 text-white"
          : "border-card-tint bg-card-tint text-neutral-text",
        className,
      )}
    >
      {label}
    </span>
  );
}
