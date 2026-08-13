"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface SwitchProps {
  defaultChecked?: boolean;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export function Switch({
  defaultChecked = false,
  checked,
  onChange,
  className,
}: SwitchProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const isOn = checked ?? internal;

  function toggle() {
    const next = !isOn;
    if (checked === undefined) setInternal(next);
    onChange?.(next);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      onClick={toggle}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        isOn ? "bg-brand-blue" : "bg-card-tint",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
          isOn ? "translate-x-5" : "translate-x-0.5",
        )}
      />
    </button>
  );
}
