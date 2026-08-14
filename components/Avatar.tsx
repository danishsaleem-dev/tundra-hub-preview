import { cn } from "@/lib/cn";

const PALETTE = [
  "bg-brand-blue",
  "bg-surface-navy",
  "bg-surface-navy-deep",
  "bg-neutral-text",
];

function paletteIndex(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % PALETTE.length;
}

function initialsFrom(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const SIZE_CLASS = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-11 w-11 text-sm",
};

export interface AvatarProps {
  name: string;
  initials?: string;
  size?: keyof typeof SIZE_CLASS;
  className?: string;
}

export function Avatar({ name, initials, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        PALETTE[paletteIndex(name)],
        SIZE_CLASS[size],
        className,
      )}
    >
      {initials ?? initialsFrom(name)}
    </span>
  );
}
