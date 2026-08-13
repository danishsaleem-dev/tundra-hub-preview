import { cn } from "@/lib/cn";

export interface ActivityItemProps {
  title: string;
  meta: string;
  dotColor?: string;
  className?: string;
}

export function ActivityItem({
  title,
  meta,
  dotColor = "bg-brand-blue",
  className,
}: ActivityItemProps) {
  return (
    <li className={cn("flex gap-2.5 py-2 first:pt-0 last:pb-0", className)}>
      <span
        className={cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", dotColor)}
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-snug text-[#0B1330]">
          {title}
        </p>
        <p className="mt-0.5 text-xs text-neutral-text">{meta}</p>
      </div>
    </li>
  );
}
