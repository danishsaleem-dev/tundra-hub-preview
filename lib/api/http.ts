import "server-only";
import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonValidationError(error: ZodError) {
  return NextResponse.json(
    { error: "Validation failed", issues: error.issues },
    { status: 400 },
  );
}

export interface ListParams {
  skip: number;
  take: number;
  includeArchived: boolean;
}

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

// Shared list-query parsing for both list routes — clamps page/pageSize so
// a client can't request an unbounded result set, and defaults to hiding
// archived (soft-deleted) records unless explicitly asked for.
export function parseListParams(url: URL): ListParams {
  const pageRaw = Number(url.searchParams.get("page"));
  const pageSizeRaw = Number(url.searchParams.get("pageSize"));

  const page = Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const pageSize =
    Number.isInteger(pageSizeRaw) && pageSizeRaw > 0
      ? Math.min(pageSizeRaw, MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

  return {
    skip: (page - 1) * pageSize,
    take: pageSize,
    includeArchived: url.searchParams.get("includeArchived") === "true",
  };
}

// Flattens a `recruiter: { name } | null` relation to a display name —
// every module whose list/detail view needs a human recruiter name
// instead of a raw recruiterId shapes its response through this, so
// there's one flattening rule, not one per route.
export function withRecruiterName<T extends { recruiter: { name: string } | null }>(
  record: T,
): Omit<T, "recruiter"> & { recruiterName: string | null } {
  const { recruiter, ...rest } = record;
  return { ...rest, recruiterName: recruiter?.name ?? null };
}
