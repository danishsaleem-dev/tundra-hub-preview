import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { FormLabel } from "@/components/FormLabel";

export interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  containerClassName?: string;
}

export function TextField({
  label,
  id,
  className,
  containerClassName,
  ...props
}: TextFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      <FormLabel htmlFor={inputId}>{label}</FormLabel>
      <input
        id={inputId}
        className={cn(
          "w-full rounded-lg border border-card-tint bg-white px-3 py-2 text-sm text-surface-navy placeholder:text-neutral-text focus:border-brand-blue focus:outline-none",
          className,
        )}
        {...props}
      />
    </div>
  );
}
