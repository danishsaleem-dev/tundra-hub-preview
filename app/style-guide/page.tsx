import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";
import { NavShell } from "@/components/NavShell";
import { KpiCard, type KpiAccent } from "@/components/KpiCard";
import { AlertBanner } from "@/components/AlertBanner";
import { StatusChip } from "@/components/StatusChip";
import { Panel } from "@/components/Panel";
import { DataTable, type Column } from "@/components/DataTable";
import type { StatusVariant } from "@/lib/status";
import { TopBarDemo } from "./TopBarDemo";

export const metadata: Metadata = {
  title: "Style Guide — Tundra Sports Hub",
};

const KPI_ACCENTS: KpiAccent[] = ["brand", "success", "warning", "critical"];
const STATUS_VARIANTS: StatusVariant[] = [
  "success",
  "warning",
  "critical",
  "neutral",
];

interface DealRow {
  brand: string;
  athlete: string;
  amount: string;
  status: StatusVariant;
  statusLabel: string;
}

const DEAL_ROWS: DealRow[] = [
  {
    brand: "Velocity Apparel",
    athlete: "Caleb Fontaine",
    amount: "$18,000",
    status: "success",
    statusLabel: "Active",
  },
  {
    brand: "Glacier Energy Drinks",
    athlete: "Marcus Bellamy",
    amount: "$24,000",
    status: "warning",
    statusLabel: "Payment Overdue",
  },
  {
    brand: "ProEdge Training Center",
    athlete: "Trevon Garris",
    amount: "$6,500",
    status: "neutral",
    statusLabel: "Pre-Launch",
  },
];

const DEAL_COLUMNS: Column<DealRow>[] = [
  { key: "brand", header: "Brand", render: (row) => row.brand },
  { key: "athlete", header: "Athlete", render: (row) => row.athlete },
  {
    key: "amount",
    header: "Amount",
    align: "right",
    render: (row) => <span className="font-semibold">{row.amount}</span>,
  },
  {
    key: "status",
    header: "Status",
    align: "right",
    render: (row) => (
      <StatusChip variant={row.status} label={row.statusLabel} />
    ),
  },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-bold text-[#0B1330]">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-sm text-neutral-text">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, hex }: { name: string; hex: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-card-tint bg-white p-3">
      <span
        className="h-9 w-9 shrink-0 rounded-md border border-black/5"
        style={{ backgroundColor: hex }}
      />
      <div className="leading-tight">
        <p className="text-sm font-semibold text-[#0B1330]">{name}</p>
        <p className="text-xs text-neutral-text">{hex}</p>
      </div>
    </div>
  );
}

export default function StyleGuidePage() {
  return (
    <div className="min-h-screen bg-page-bg pb-24">
      <header className="border-b border-card-tint bg-white px-8 py-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-blue">
          Component Library
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[#0B1330]">
          Tundra Sports Hub — Style Guide
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-text">
          Every reusable component and semantic variant in one place, for
          reviewing the system at a glance.
        </p>
      </header>

      <div className="mx-auto flex max-w-5xl flex-col gap-12 px-8 py-10">
        <Section
          title="Foundations — Colors"
          description="Brand and semantic status tokens sampled from the approved mockup."
        >
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Swatch name="brand-blue" hex="#0877E3" />
            <Swatch name="surface-navy" hex="#06133A" />
            <Swatch name="surface-navy-deep" hex="#071542" />
            <Swatch name="page-bg" hex="#F0F2FF" />
            <Swatch name="card-tint" hex="#ECEEFB" />
          </div>
        </Section>

        <Section title="StatusChip" description="Four semantic states.">
          <div className="flex flex-wrap gap-2 rounded-lg border border-card-tint bg-white p-4">
            {STATUS_VARIANTS.map((variant) => (
              <StatusChip
                key={variant}
                variant={variant}
                label={
                  variant === "success"
                    ? "Active"
                    : variant === "warning"
                      ? "Due Soon"
                      : variant === "critical"
                        ? "Overdue"
                        : "Pending"
                }
              />
            ))}
          </div>
        </Section>

        <Section
          title="KpiCard"
          description="Colored top border communicates status at a glance."
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {KPI_ACCENTS.map((accent) => (
              <KpiCard
                key={accent}
                accent={accent}
                label={
                  accent === "brand"
                    ? "Active Deals"
                    : accent === "success"
                      ? "Payments Received"
                      : accent === "warning"
                        ? "Upcoming Payment"
                        : "Overdue"
                }
                value={
                  accent === "brand"
                    ? "4"
                    : accent === "success"
                      ? "$35,500"
                      : accent === "warning"
                        ? "$8,000"
                        : "$12,500"
                }
                subtext={
                  accent === "brand"
                    ? "All active"
                    : accent === "success"
                      ? "All time"
                      : accent === "warning"
                        ? "In pipeline"
                        : "2 invoices past due"
                }
              />
            ))}
          </div>
        </Section>

        <Section
          title="AlertBanner"
          description="Left accent bar, icon, message, optional action."
        >
          <div className="space-y-3">
            <AlertBanner
              variant="critical"
              message={
                <>
                  <span className="font-semibold">Overdue Payment:</span>{" "}
                  Velocity Apparel — $4,500 outstanding, 34 days since invoice
                </>
              }
              action={
                <button
                  type="button"
                  className="rounded-md border border-critical-text px-3 py-1.5 text-xs font-semibold text-critical-text transition-colors hover:bg-critical-bg"
                >
                  Send Reminder
                </button>
              }
            />
            <AlertBanner
              variant="warning"
              message={
                <>
                  <span className="font-semibold">Compliance Overdue:</span>{" "}
                  NIL Activity Disclosure — ProEdge Training, deal on hold
                </>
              }
              action={
                <span className="text-xs font-bold text-warning-text">
                  ACTION REQUIRED
                </span>
              }
            />
            <AlertBanner
              variant="success"
              message="All Q1 compliance filings submitted on time."
            />
          </div>
        </Section>

        <Section
          title="DataTable"
          description="Uppercase headers, right-aligned currency, inline chips."
        >
          <div className="rounded-lg border border-card-tint bg-white p-4">
            <DataTable
              columns={DEAL_COLUMNS}
              rows={DEAL_ROWS}
              rowKey={(row) => row.brand}
            />
          </div>
        </Section>

        <Section
          title="Panel"
          description="Generic container — default and dark (AI briefing) tones."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Panel title="Deal Health">
              <ul className="space-y-2 text-sm text-[#0B1330]">
                <li className="flex items-center justify-between">
                  <span>Velocity Apparel — Caleb Fontaine</span>
                  <StatusChip variant="success" label="Active" />
                </li>
                <li className="flex items-center justify-between">
                  <span>Glacier Energy — Marcus Bellamy</span>
                  <StatusChip variant="warning" label="Payment Overdue" />
                </li>
              </ul>
            </Panel>
            <Panel title="AI Executive Briefing" icon={Sparkles} tone="dark">
              <p className="text-sm leading-relaxed text-slate-300">
                <span className="font-semibold text-white">
                  Revenue Risk:
                </span>{" "}
                Two overdue payments totaling{" "}
                <span className="font-semibold text-critical-text">
                  $12,500
                </span>{" "}
                require immediate follow-up.
              </p>
              <p className="mt-3 text-xs text-slate-500">
                MOCK AI OUTPUT · Not a real integration
              </p>
            </Panel>
          </div>
        </Section>

        <Section
          title="TopBar"
          description="Page title, role switcher, notification bell."
        >
          <div className="overflow-hidden rounded-lg border border-card-tint">
            <TopBarDemo />
          </div>
        </Section>

        <Section
          title="NavShell"
          description="Role-filtered sidebar navigation with active state."
        >
          <div className="grid gap-4 overflow-hidden rounded-lg border border-card-tint sm:grid-cols-3">
            {(["admin", "recruiter", "athlete"] as const).map((role) => (
              <div key={role} className="h-[420px] overflow-hidden">
                <NavShell role={role} className="h-full w-full" />
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
