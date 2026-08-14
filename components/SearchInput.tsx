import type { InputHTMLAttributes } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

export function SearchInput({ className, ...props }: SearchInputProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-text" />
      <input
        type="text"
        className="w-full rounded-lg border border-card-tint bg-white py-2 pl-9 pr-3 text-sm text-surface-navy placeholder:text-neutral-text focus:border-brand-blue focus:outline-none"
        {...props}
      />
    </div>
  );
}
