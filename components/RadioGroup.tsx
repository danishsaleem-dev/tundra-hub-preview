"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

export interface RadioGroupProps {
  label?: string;
  options: RadioOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

export function RadioGroup({
  label,
  options,
  defaultValue,
  value,
  onChange,
  className,
}: RadioGroupProps) {
  const [internal, setInternal] = useState(
    defaultValue ?? options[0]?.value ?? "",
  );
  const active = value ?? internal;

  function select(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <p className="text-sm font-semibold text-surface-navy">{label}</p>
      ) : null}
      <div className="space-y-2">
        {options.map((option) => {
          const isActive = option.value === active;

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => select(option.value)}
              className={cn(
                "flex w-full items-start gap-2.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                isActive
                  ? "border-brand-blue bg-brand-blue/5"
                  : "border-card-tint hover:bg-page-bg",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                  isActive ? "border-brand-blue" : "border-card-tint",
                )}
              >
                {isActive ? (
                  <span className="h-2 w-2 rounded-full bg-brand-blue" />
                ) : null}
              </span>
              <span>
                <span className="block text-sm font-medium text-surface-navy">
                  {option.label}
                </span>
                {option.description ? (
                  <span className="block text-xs text-neutral-text">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
