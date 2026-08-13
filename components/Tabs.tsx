"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface TabItem {
  key: string;
  label: string;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  value?: string;
  onChange?: (key: string) => void;
  className?: string;
}

export function Tabs({
  items,
  defaultValue,
  value,
  onChange,
  className,
}: TabsProps) {
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.key ?? "");
  const active = value ?? internal;

  function select(key: string) {
    if (value === undefined) setInternal(key);
    onChange?.(key);
  }

  return (
    <div className={cn("flex gap-5 border-b border-card-tint", className)}>
      {items.map((item) => {
        const isActive = item.key === active;

        return (
          <button
            key={item.key}
            type="button"
            onClick={() => select(item.key)}
            className={cn(
              "-mb-px border-b-2 pb-2.5 text-sm font-semibold transition-colors",
              isActive
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-neutral-text hover:text-[#0B1330]",
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
