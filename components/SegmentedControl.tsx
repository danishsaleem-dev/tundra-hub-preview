"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface SegmentedOption {
  value: string;
  label: string;
  count?: number;
}

export interface SegmentedControlProps {
  options: SegmentedOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  className,
}: SegmentedControlProps) {
  const [internal, setInternal] = useState(
    defaultValue ?? options[0]?.value ?? "",
  );
  const active = value ?? internal;

  function select(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {options.map((option) => {
        const isActive = option.value === active;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => select(option.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              isActive
                ? "bg-brand-blue text-white"
                : "border border-card-tint bg-white text-neutral-text hover:bg-page-bg",
            )}
          >
            {option.label}
            {option.count !== undefined ? ` (${option.count})` : ""}
          </button>
        );
      })}
    </div>
  );
}
