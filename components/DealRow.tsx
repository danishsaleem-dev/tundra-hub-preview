"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { StatusChip } from "@/components/StatusChip";
import type { StatusVariant } from "@/lib/status";

export interface DealChip {
  variant: StatusVariant;
  label: string;
}

export interface DealDetailField {
  label: string;
  value: string;
}

export interface DealRowProps {
  code: string;
  title: string;
  brand: string;
  athlete: string;
  deadline: string;
  chips: DealChip[];
  amount: string;
  paid: string;
  due: string;
  details: DealDetailField[];
  deliverables: string[];
  riskFlags: string[];
  paymentSummary: { total: string; paid: string; outstanding: string };
  defaultOpen?: boolean;
  className?: string;
}

export function DealRow({
  code,
  title,
  brand,
  athlete,
  deadline,
  chips,
  amount,
  paid,
  due,
  details,
  deliverables,
  riskFlags,
  paymentSummary,
  defaultOpen = false,
  className,
}: DealRowProps) {
  const [open, setOpen] = useState(defaultOpen);
  const hasRisk = riskFlags.length > 0;

  return (
    <div
      className={cn(
        "rounded-xl border bg-white",
        hasRisk ? "border-warning-text/30" : "border-card-tint",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-card-tint text-sm font-bold text-brand-blue">
          {code}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-[#0B1330]">{title}</p>
            {chips.map((chip) => (
              <StatusChip key={chip.label} variant={chip.variant} label={chip.label} />
            ))}
          </div>
          <p className="mt-0.5 truncate text-xs text-neutral-text">
            Brand: <span className="font-medium">{brand}</span> · Athlete:{" "}
            <span className="font-medium">{athlete}</span> · Deadline: {deadline}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-0.5">
          <span className="text-base font-bold text-[#0B1330]">{amount}</span>
          <span className="text-xs">
            <span className="font-medium text-success-text">{paid} paid</span>{" "}
            <span className="text-neutral-text">·</span>{" "}
            <span className="font-medium text-warning-text">{due} due</span>
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-neutral-text transition-transform",
            open ? "rotate-180" : undefined,
          )}
        />
      </button>

      {open ? (
        <div className="grid gap-6 border-t border-card-tint px-4 py-4 sm:grid-cols-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-text">
              Deal Details
            </p>
            <dl className="mt-2 space-y-1.5">
              {details.map((detail) => (
                <div
                  key={detail.label}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <dt className="text-neutral-text">{detail.label}</dt>
                  <dd className="font-medium text-[#0B1330]">{detail.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-text">
              Deliverables
            </p>
            <ul className="mt-2 space-y-1.5">
              {deliverables.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-1.5 text-xs text-[#0B1330]"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-blue" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-text">
                Risk Flags
              </p>
              {hasRisk ? (
                <ul className="mt-2 space-y-1.5">
                  {riskFlags.map((flag) => (
                    <li
                      key={flag}
                      className="text-xs font-medium text-warning-text"
                    >
                      {flag}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-success-text">
                  <Check className="h-3.5 w-3.5" /> No risk flags
                </p>
              )}
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-neutral-text">
                Payment Summary
              </p>
              <dl className="mt-2 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <dt className="text-neutral-text">Total</dt>
                  <dd className="font-semibold text-[#0B1330]">
                    {paymentSummary.total}
                  </dd>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <dt className="text-neutral-text">Paid</dt>
                  <dd className="font-semibold text-success-text">
                    {paymentSummary.paid}
                  </dd>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <dt className="text-neutral-text">Outstanding</dt>
                  <dd className="font-semibold text-warning-text">
                    {paymentSummary.outstanding}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
