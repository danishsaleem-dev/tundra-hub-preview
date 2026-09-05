// Decimal fields arrive from Prisma/the API as fixed-point strings (e.g.
// "22500.00"), never numbers — this formats those for display without
// round-tripping through floating point.
export function formatCurrency(value: string | number): string {
  const amount = typeof value === "string" ? Number(value) : value;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Coarse relative time for activity feeds — matches the granularity the
// reference dashboard mockup used ("85d ago"), not a precise duration.
export function formatRelativeTime(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

// Turns a raw camelCase field name into a readable label for validation/
// permission error messages (e.g. "eligibilityRemaining" -> "Eligibility
// Remaining"). Not a lookup table — these are per-field API property
// names, not the small fixed set of entity/product names in lib/labels.ts.
export function humanizeFieldName(field: string): string {
  return field
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (char) => char.toUpperCase());
}
