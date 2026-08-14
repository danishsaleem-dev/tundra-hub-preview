import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { FormLabel } from "@/components/FormLabel";

export interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  containerClassName?: string;
}

export function TextareaField({
  label,
  id,
  rows = 4,
  className,
  containerClassName,
  ...props
}: TextareaFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      <FormLabel htmlFor={inputId}>{label}</FormLabel>
      <textarea
        id={inputId}
        rows={rows}
        className={cn(
          "w-full resize-y rounded-lg border border-card-tint bg-white px-3 py-2 text-sm text-surface-navy placeholder:text-neutral-text focus:border-brand-blue focus:outline-none",
          className,
        )}
        {...props}
      />
    </div>
  );
}
