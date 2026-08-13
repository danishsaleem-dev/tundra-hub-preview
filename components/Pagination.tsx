"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

function getPageList(current: number, count: number): (number | "ellipsis")[] {
  if (count <= 7) {
    return Array.from({ length: count }, (_, i) => i + 1);
  }

  const pages: (number | "ellipsis")[] = [1];
  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(count - 1, current + 1);
  for (let page = start; page <= end; page++) pages.push(page);

  if (current < count - 2) pages.push("ellipsis");
  pages.push(count);

  return pages;
}

export interface PaginationProps {
  page?: number;
  defaultPage?: number;
  pageCount: number;
  onPageChange?: (page: number) => void;
  totalLabel?: string;
  className?: string;
}

export function Pagination({
  page,
  defaultPage = 1,
  pageCount,
  onPageChange,
  totalLabel,
  className,
}: PaginationProps) {
  const [internal, setInternal] = useState(defaultPage);
  const current = page ?? internal;

  function go(next: number) {
    const clamped = Math.min(Math.max(1, next), pageCount);
    if (page === undefined) setInternal(clamped);
    onPageChange?.(clamped);
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3",
        className,
      )}
    >
      {totalLabel ? (
        <p className="text-xs text-neutral-text">{totalLabel}</p>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => go(current - 1)}
          disabled={current === 1}
          aria-label="Previous page"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-card-tint text-neutral-text transition-colors hover:bg-page-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {getPageList(current, pageCount).map((entry, index) =>
          entry === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-8 w-8 items-center justify-center text-sm text-neutral-text"
            >
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => go(entry)}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium transition-colors",
                entry === current
                  ? "bg-brand-blue text-white"
                  : "text-neutral-text hover:bg-page-bg",
              )}
            >
              {entry}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => go(current + 1)}
          disabled={current === pageCount}
          aria-label="Next page"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-card-tint text-neutral-text transition-colors hover:bg-page-bg disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
