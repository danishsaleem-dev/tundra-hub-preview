import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant =
  | "primary"
  | "outline"
  | "outline-danger"
  | "danger"
  | "ghost";
export type ButtonSize = "sm" | "md" | "icon";

const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: "bg-brand-blue text-white shadow-sm hover:bg-brand-blue/90",
  outline:
    "border border-card-tint bg-white text-surface-navy hover:bg-page-bg",
  "outline-danger":
    "border border-critical-text text-critical-text hover:bg-critical-bg",
  danger: "bg-critical-text text-white shadow-sm hover:bg-critical-text/90",
  ghost: "text-surface-navy hover:bg-page-bg",
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  icon: "h-9 w-9 p-0",
};

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  className,
  children,
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/40 disabled:pointer-events-none disabled:grayscale disabled:opacity-50",
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : icon}
      {size === "icon" ? null : children}
    </button>
  );
}
