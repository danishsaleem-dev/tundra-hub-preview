import type { ReactNode } from "react";

export interface FormLabelProps {
  htmlFor?: string;
  children: ReactNode;
}

export function FormLabel({ htmlFor, children }: FormLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-semibold text-surface-navy"
    >
      {children}
    </label>
  );
}
