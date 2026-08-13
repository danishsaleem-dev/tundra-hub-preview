export type StatusVariant = "success" | "warning" | "critical" | "neutral";

export const STATUS_STYLES: Record<
  StatusVariant,
  { bg: string; text: string }
> = {
  success: { bg: "bg-success-bg", text: "text-success-text" },
  warning: { bg: "bg-warning-bg", text: "text-warning-text" },
  critical: { bg: "bg-critical-bg", text: "text-critical-text" },
  neutral: { bg: "bg-neutral-bg", text: "text-neutral-text" },
};
