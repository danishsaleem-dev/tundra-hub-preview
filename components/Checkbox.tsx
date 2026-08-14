"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

export interface CheckboxProps {
  label: string;
  description?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Checkbox({
  label,
  description,
  defaultChecked = false,
  checked,
  onChange,
  className,
}: CheckboxProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const isChecked = checked ?? internal;

  function toggle() {
    const next = !isChecked;
    if (checked === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={isChecked}
      onClick={toggle}
      className={cn("flex items-start gap-2.5 text-left", className)}
    >
      <span
        className={cn(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
          isChecked
            ? "border-brand-blue bg-brand-blue"
            : "border-card-tint bg-white",
        )}
      >
        {isChecked ? (
          <Check className="h-3 w-3 text-white" strokeWidth={3} />
        ) : null}
      </span>
      <span>
        <span className="block text-sm font-medium text-surface-navy">
          {label}
        </span>
        {description ? (
          <span className="block text-xs text-neutral-text">
            {description}
          </span>
        ) : null}
      </span>
    </button>
  );
}
