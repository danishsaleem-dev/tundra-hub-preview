import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";
import { FormLabel } from "@/components/FormLabel";

export interface SelectFieldOption {
  value: string;
  label: string;
}

export interface SelectFieldProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectFieldOption[];
  containerClassName?: string;
}

export function SelectField({
  label,
  options,
  id,
  className,
  containerClassName,
  ...props
}: SelectFieldProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("space-y-1.5", containerClassName)}>
      <FormLabel htmlFor={inputId}>{label}</FormLabel>
      <div className="relative">
        <select
          id={inputId}
          className={cn(
            "w-full appearance-none rounded-lg border border-card-tint bg-white px-3 py-2 pr-9 text-sm text-[#0B1330] focus:border-brand-blue focus:outline-none",
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-text" />
      </div>
    </div>
  );
}
