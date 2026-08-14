"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { FormLabel } from "@/components/FormLabel";

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps {
  label: string;
  options: SelectFieldOption[];
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  containerClassName?: string;
}

export function SelectField({
  label,
  options,
  defaultValue,
  value,
  onChange,
  placeholder = "Select…",
  className,
  containerClassName,
}: SelectFieldProps) {
  const [open, setOpen] = useState(false);
  const [internal, setInternal] = useState(defaultValue ?? options[0]?.value ?? "");
  const active = value ?? internal;
  const activeOption = options.find((option) => option.value === active);

  function select(next: string) {
    if (value === undefined) setInternal(next);
    onChange?.(next);
    setOpen(false);
  }

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      <FormLabel>{label}</FormLabel>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-lg border border-card-tint bg-white px-3 py-2 text-left text-sm text-surface-navy transition-colors hover:border-brand-blue/40 focus:border-brand-blue focus:outline-none",
            open && "border-brand-blue",
            className,
          )}
        >
          <span className={cn(!activeOption && "text-neutral-text")}>
            {activeOption ? activeOption.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-neutral-text transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        {open ? (
          <>
            <button
              type="button"
              aria-label="Close menu"
              className="fixed inset-0 z-10 cursor-default"
              onClick={() => setOpen(false)}
            />
            <div className="absolute left-0 right-0 z-20 mt-1.5 max-h-60 overflow-y-auto rounded-lg border border-card-tint bg-white py-1 shadow-lg">
              {options.map((option) => {
                const isActive = option.value === active;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => select(option.value)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-page-bg",
                      isActive
                        ? "font-semibold text-brand-blue"
                        : "text-surface-navy",
                    )}
                  >
                    {option.label}
                    {isActive ? <Check className="h-3.5 w-3.5" /> : null}
                  </button>
                );
              })}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
