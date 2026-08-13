import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import { Sparkles, Plus, Upload, Clock, AlertTriangle, Search, Trash2 } from "lucide-react";
import { NavShell } from "@/components/NavShell";
import { KpiCard, type KpiAccent } from "@/components/KpiCard";
import { AlertBanner } from "@/components/AlertBanner";
import { StatusChip } from "@/components/StatusChip";
import { Panel } from "@/components/Panel";
import { DataTable, type Column } from "@/components/DataTable";
import { Button } from "@/components/Button";
import { SegmentedControl } from "@/components/SegmentedControl";
import { SearchInput } from "@/components/SearchInput";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { ProgressBar } from "@/components/ProgressBar";
import { SectionHeader } from "@/components/SectionHeader";
import { ListRow } from "@/components/ListRow";
import { ActivityItem } from "@/components/ActivityItem";
import { DealRow } from "@/components/DealRow";
import { TextField } from "@/components/TextField";
import { TextareaField } from "@/components/TextareaField";
import { SelectField } from "@/components/SelectField";
import { RadioGroup } from "@/components/RadioGroup";
import { Checkbox } from "@/components/Checkbox";
import { FileUpload } from "@/components/FileUpload";
import { Tabs } from "@/components/Tabs";
import { Pagination } from "@/components/Pagination";
import { EmptyState } from "@/components/EmptyState";
import type { StatusVariant } from "@/lib/status";
import { TopBarDemo } from "./TopBarDemo";
import { ModalDemo } from "./ModalDemo";
import { ToastDemo } from "./ToastDemo";

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

interface RecruiterRow {
  name: string;
  region: string;
  athletes: number;
  prospects: number;
}

const RECRUITER_ROWS: RecruiterRow[] = [
  { name: "Marcus Webb", region: "Georgia", athletes: 2, prospects: 3 },
  { name: "Darnell Okafor", region: "Florida", athletes: 1, prospects: 2 },
  { name: "Jordan Pierce", region: "Georgia / Southeast", athletes: 1, prospects: 2 },
];

const RECRUITER_COLUMNS: Column<RecruiterRow>[] = [
  {
    key: "name",
    header: "Recruiter",
    render: (row) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={row.name} size="sm" />
        <span className="font-medium">{row.name}</span>
      </div>
    ),
  },
  { key: "region", header: "Region", render: (row) => row.region },
  {
    key: "athletes",
    header: "Athletes",
    align: "right",
    render: (row) => row.athletes,
  },
  {
    key: "prospects",
    header: "Prospects",
    align: "right",
    render: (row) => row.prospects,
  },
];

interface AthleteRow {
  name: string;
  location: string;
  position: string;
  school: string;
  yearEligibility: string;
  recruiter: string;
  compliance: StatusVariant;
  complianceLabel: string;
  onboarding: StatusVariant;
  onboardingLabel: string;
  deals: string;
}

const ATHLETES: AthleteRow[] = [
  {
    name: "Caleb Fontaine",
    location: "Alpharetta, GA",
    position: "QB",
    school: "University of Georgia",
    yearEligibility: "Junior · Eligible",
    recruiter: "Marcus Webb",
    compliance: "success",
    complianceLabel: "Compliant",
    onboarding: "success",
    onboardingLabel: "Complete",
    deals: "2 active · $28,500",
  },
  {
    name: "DeShawn Tillery",
    location: "Macon, GA",
    position: "WR",
    school: "Georgia Tech",
    yearEligibility: "Sophomore · Eligible",
    recruiter: "Marcus Webb",
    compliance: "warning",
    complianceLabel: "Pending Review",
    onboarding: "success",
    onboardingLabel: "Complete",
    deals: "1 active · $9,000",
  },
  {
    name: "Marcus Bellamy",
    location: "Jacksonville, FL",
    position: "RB",
    school: "University of Florida",
    yearEligibility: "Senior · Final Season",
    recruiter: "Darnell Okafor",
    compliance: "success",
    complianceLabel: "Compliant",
    onboarding: "success",
    onboardingLabel: "Complete",
    deals: "2 active · $41,000",
  },
  {
    name: "Trevon Garris",
    location: "Gainesville, GA",
    position: "OLB",
    school: "Kennesaw State University",
    yearEligibility: "Junior · Eligible",
    recruiter: "Jordan Pierce",
    compliance: "critical",
    complianceLabel: "Action Required",
    onboarding: "warning",
    onboardingLabel: "In Progress",
    deals: "1 active · $6,500",
  },
  {
    name: "Jaylon Prescott",
    location: "Athens, GA",
    position: "CB",
    school: "University of Georgia",
    yearEligibility: "Senior · Eligible",
    recruiter: "Tyrese Harmon",
    compliance: "success",
    complianceLabel: "Compliant",
    onboarding: "success",
    onboardingLabel: "Complete",
    deals: "1 active · $15,000",
  },
];

const ATHLETE_COLUMNS: Column<AthleteRow>[] = [
  {
    key: "name",
    header: "Athlete",
    render: (row) => (
      <div className="flex items-center gap-2.5">
        <Avatar name={row.name} size="sm" />
        <div className="leading-tight">
          <p className="font-medium text-[#0B1330]">{row.name}</p>
          <p className="text-xs text-neutral-text">{row.location}</p>
        </div>
      </div>
    ),
  },
  {
    key: "position",
    header: "Position",
    render: (row) => <Badge label={row.position} />,
  },
  { key: "school", header: "School", render: (row) => row.school },
  {
    key: "year",
    header: "Year / Eligibility",
    render: (row) => row.yearEligibility,
  },
  { key: "recruiter", header: "Recruiter", render: (row) => row.recruiter },
  {
    key: "compliance",
    header: "Compliance",
    render: (row) => (
      <StatusChip variant={row.compliance} label={row.complianceLabel} />
    ),
  },
  {
    key: "onboarding",
    header: "Onboarding",
    render: (row) => (
      <StatusChip variant={row.onboarding} label={row.onboardingLabel} />
    ),
  },
  {
    key: "deals",
    header: "Deals",
    align: "right",
    render: (row) => row.deals,
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

      <div className="mx-auto flex max-w-[1300px] flex-col gap-12 px-8 py-10">
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

        <Section
          title="Logo"
          description="Real brand mark — light lockup for white/card surfaces, icon mark for dark surfaces and favicon."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-center rounded-lg border border-card-tint bg-white p-8">
              <Image
                src="/brand/tundra-logo-transparent.png"
                alt="Tundra Sports Group"
                width={1160}
                height={297}
                className="h-10 w-auto"
              />
            </div>
            <div className="flex items-center justify-center gap-4 rounded-lg bg-surface-navy p-8">
              <Image
                src="/brand/tundra-icon-mark.png"
                alt=""
                width={225}
                height={225}
                className="h-12 w-12"
              />
              <span className="text-sm font-semibold text-white">
                Icon mark — sidebar & favicon
              </span>
            </div>
          </div>
        </Section>

        <Section
          title="Button"
          description="Primary, outline, danger (solid + outline), ghost, and icon-only — sm/md sizes, plus loading and disabled states."
        >
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-card-tint bg-white p-4">
            <Button icon={<Plus className="h-3.5 w-3.5" />}>New Deal</Button>
            <Button variant="outline" icon={<Upload className="h-3.5 w-3.5" />}>
              Upload Document
            </Button>
            <Button variant="outline-danger" size="sm">
              Send Reminder
            </Button>
            <Button variant="danger" size="sm" icon={<Trash2 className="h-3.5 w-3.5" />}>
              Delete Athlete
            </Button>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Delete row"
              icon={<Trash2 className="h-4 w-4" />}
            />
            <Button size="sm" loading>
              Saving
            </Button>
            <Button disabled size="sm">
              Disabled
            </Button>
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
          title="Badge"
          description="Filled tag for role/access/position labels — muted gray, distinct from StatusChip's semantic pills."
        >
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-card-tint bg-white p-4">
            <Badge label="ADMIN" />
            <Badge label="BETA" />
            <div className="rounded-lg bg-surface-navy p-2">
              <Badge label="ADMIN" tone="dark" />
            </div>
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
          title="ProgressBar"
          description="Label + stat row over a track fill — used for pipeline/region breakdowns."
        >
          <div className="space-y-4 rounded-lg border border-card-tint bg-white p-4">
            <ProgressBar
              label="Georgia"
              subtext="6 prospects · 3 athletes"
              percent={75}
            />
            <ProgressBar
              label="Florida"
              subtext="4 prospects · 2 athletes"
              percent={45}
            />
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
                <Button variant="outline-danger" size="sm">
                  Send Reminder
                </Button>
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
          title="SectionHeader"
          description="Accent-colored group headers used to break up long lists."
        >
          <div className="space-y-4 rounded-lg border border-card-tint bg-white p-4">
            <SectionHeader
              label="Overdue — Immediate Action Required"
              count={2}
              accent="critical"
              icon={AlertTriangle}
              collapsible
            />
            <SectionHeader
              label="Open & In Progress"
              count={5}
              accent="neutral"
              icon={Clock}
              collapsible
            />
          </div>
        </Section>

        <Section
          title="SearchInput & Filters"
          description="Search field plus self-contained pill filters — also used as a view-toggle."
        >
          <div className="space-y-4 rounded-lg border border-card-tint bg-white p-4">
            <SearchInput placeholder="Search prospects..." className="max-w-sm" />
            <SegmentedControl
              options={[
                { value: "all", label: "All" },
                { value: "critical", label: "Critical" },
                { value: "high", label: "High" },
                { value: "medium", label: "Medium" },
                { value: "low", label: "Low" },
              ]}
            />
            <SegmentedControl
              options={[
                { value: "table", label: "Table" },
                { value: "pipeline", label: "Pipeline" },
              ]}
            />
          </div>
        </Section>

        <Section
          title="Form Fields"
          description="TextField, TextareaField, SelectField, RadioGroup, Checkbox, FileUpload — composed here as a sample Add Athlete form."
        >
          <div className="grid gap-4 rounded-lg border border-card-tint bg-white p-4 sm:grid-cols-2">
            <TextField label="Full Name" placeholder="Caleb Fontaine" />
            <SelectField
              label="Position"
              options={[
                { value: "qb", label: "QB" },
                { value: "wr", label: "WR" },
                { value: "rb", label: "RB" },
                { value: "olb", label: "OLB" },
                { value: "cb", label: "CB" },
              ]}
            />
            <TextareaField
              label="Bio"
              placeholder="Dual-threat QB with 2,800+ passing yards last season."
              containerClassName="sm:col-span-2"
            />
            <RadioGroup
              label="Eligibility"
              options={[
                { value: "eligible", label: "Eligible", description: "Cleared to compete and sign NIL deals" },
                { value: "pending", label: "Pending Review", description: "Compliance is still verifying eligibility" },
              ]}
            />
            <FileUpload label="Headshot" hint="PNG or JPG up to 5MB" />
            <div className="sm:col-span-2">
              <Checkbox
                label="Notify assigned recruiter"
                description="Send an email once this athlete is added to the roster"
                defaultChecked
              />
            </div>
            <div className="flex gap-2 sm:col-span-2">
              <Button>Add Athlete</Button>
              <Button variant="outline">Cancel</Button>
            </div>
          </div>
        </Section>

        <Section
          title="Modal"
          description="Backdrop + centered panel, closes on backdrop click or Escape."
        >
          <div className="rounded-lg border border-card-tint bg-white p-4">
            <ModalDemo />
          </div>
        </Section>

        <Section
          title="Toast"
          description="Auto-dismissing notification stack, driven by a useToast() hook available anywhere in the app."
        >
          <div className="rounded-lg border border-card-tint bg-white p-4">
            <ToastDemo />
          </div>
        </Section>

        <Section
          title="Tabs"
          description="Horizontal underline tabs — for detail-page sections rather than sidebar navigation."
        >
          <div className="rounded-lg border border-card-tint bg-white p-4">
            <Tabs
              items={[
                { key: "overview", label: "Overview" },
                { key: "deals", label: "Deals" },
                { key: "compliance", label: "Compliance" },
                { key: "documents", label: "Documents" },
              ]}
            />
          </div>
        </Section>

        <Section
          title="Pagination"
          description="Truncates to first/last + a window around the current page once there are more than 7 pages."
        >
          <div className="rounded-lg border border-card-tint bg-white p-4">
            <Pagination
              pageCount={9}
              defaultPage={4}
              totalLabel="Showing 31-40 of 86 athletes"
            />
          </div>
        </Section>

        <Section
          title="EmptyState"
          description="No-results pattern for filtered tables and empty lists."
        >
          <div className="rounded-lg border border-card-tint bg-white p-4">
            <EmptyState
              icon={Search}
              title="No athletes found"
              description="Try adjusting your search or filters to find what you're looking for."
              action={
                <Button variant="outline" size="sm">
                  Clear Filters
                </Button>
              }
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
          title="DataTable — with Avatar"
          description="Row identity via colored initials, deterministic per name."
        >
          <div className="rounded-lg border border-card-tint bg-white p-4">
            <DataTable
              columns={RECRUITER_COLUMNS}
              rows={RECRUITER_ROWS}
              rowKey={(row) => row.name}
            />
          </div>
        </Section>

        <Section
          title="Full Table Pattern — Athletes"
          description="Page header, search, and a data-dense roster table — the shared shell a real Athletes screen would use."
        >
          <div className="rounded-xl border border-card-tint bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#0B1330]">Athletes</h3>
                <p className="text-xs text-neutral-text">
                  {ATHLETES.length} athletes in roster
                </p>
              </div>
              <Button icon={<Plus className="h-3.5 w-3.5" />}>
                Add Athlete
              </Button>
            </div>
            <SearchInput
              placeholder="Search athletes..."
              className="mt-4 max-w-sm"
            />
            <div className="mt-4">
              <DataTable
                columns={ATHLETE_COLUMNS}
                rows={ATHLETES}
                rowKey={(row) => row.name}
              />
            </div>
          </div>
        </Section>

        <Section
          title="Collapsible Row Pattern — NIL Deals"
          description="DealRow — click to expand deal details, deliverables, risk flags, and payment summary."
        >
          <div className="space-y-3">
            <DealRow
              code="V"
              title="Velocity Apparel – Caleb Fontaine"
              brand="Velocity Apparel"
              athlete="Caleb Fontaine"
              deadline="2026-08-31"
              chips={[
                { variant: "success", label: "Active" },
                { variant: "success", label: "Executed" },
              ]}
              amount="$18,000"
              paid="$9,000"
              due="$9,000"
              defaultOpen
              details={[
                { label: "Contract Status", value: "Executed" },
                { label: "Start Date", value: "2025-09-01" },
                { label: "End Date", value: "2026-08-31" },
                { label: "Compliance", value: "Cleared" },
              ]}
              deliverables={[
                "4 Instagram posts/month",
                "2 in-store appearances",
                "Jersey co-branding",
              ]}
              riskFlags={[]}
              paymentSummary={{
                total: "$18,000",
                paid: "$9,000",
                outstanding: "$9,000",
              }}
            />
            <DealRow
              code="G"
              title="Glacier Energy – Marcus Bellamy"
              brand="Glacier Energy Drinks"
              athlete="Marcus Bellamy"
              deadline="2026-10-14"
              chips={[
                { variant: "success", label: "Active" },
                { variant: "success", label: "Executed" },
                { variant: "warning", label: "1 Risk Flag" },
              ]}
              amount="$24,000"
              paid="$8,000"
              due="$16,000"
              details={[
                { label: "Contract Status", value: "Executed" },
                { label: "Start Date", value: "2025-10-14" },
                { label: "End Date", value: "2026-10-14" },
                { label: "Compliance", value: "Cleared" },
              ]}
              deliverables={[
                "6 social posts/quarter",
                "1 campus activation event",
              ]}
              riskFlags={["Payment overdue 21 days"]}
              paymentSummary={{
                total: "$24,000",
                paid: "$8,000",
                outstanding: "$16,000",
              }}
            />
          </div>
        </Section>

        <Section
          title="ListRow"
          description="Title/meta/trailing row for Panel lists — optional colored accent bar and tag chips."
        >
          <Panel title="Deal Health">
            <ul className="divide-y divide-card-tint">
              <ListRow
                title="Velocity Apparel — Caleb Fontaine"
                meta="$18,000 · Ends 2026-08-31"
                trailing={<StatusChip variant="success" label="Active" />}
              />
              <ListRow
                title="Glacier Energy — Marcus Bellamy"
                meta="$24,000 · Ends 2026-10-14"
                trailing={<StatusChip variant="success" label="Active" />}
                tags={[{ variant: "warning", label: "Payment overdue 21 days" }]}
              />
              <ListRow
                title="Follow up with Velocity Apparel on overdue payment"
                meta="→ Marcus Webb"
                accent="critical"
                trailing={
                  <>
                    <StatusChip variant="critical" label="Critical" />
                    <span className="text-xs font-medium text-critical-text">
                      Overdue
                    </span>
                  </>
                }
              />
            </ul>
          </Panel>
        </Section>

        <Section
          title="ActivityItem"
          description="Colored dot + title + meta — compact feed for a Recent Activity panel."
        >
          <Panel title="Recent Activity">
            <ul className="divide-y divide-card-tint">
              <ActivityItem
                title="Sent payment reminder to Velocity Apparel for pay2"
                meta="Marcus Webb · 85d ago"
                dotColor="bg-brand-blue"
              />
              <ActivityItem
                title="Logged contact with Quinton Hargrove family (phone call)"
                meta="Aaliyah Simmons · 85d ago"
                dotColor="bg-violet-500"
              />
              <ActivityItem
                title="Signed Caleb Fontaine (re-enrollment for 2026 season)"
                meta="Marcus Webb · 87d ago"
                dotColor="bg-success-text"
              />
            </ul>
          </Panel>
        </Section>

        <Section
          title="Panel"
          description="Generic container — default and dark (AI briefing) tones."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Panel title="Deal Health">
              <ul className="divide-y divide-card-tint">
                <ListRow
                  title="Velocity Apparel — Caleb Fontaine"
                  trailing={<StatusChip variant="success" label="Active" />}
                />
                <ListRow
                  title="Glacier Energy — Marcus Bellamy"
                  trailing={<StatusChip variant="warning" label="Payment Overdue" />}
                />
              </ul>
            </Panel>
            <Panel title="AI Executive Briefing" icon={Sparkles} tone="dark">
              <p className="text-xs leading-relaxed text-slate-300">
                <span className="font-semibold text-white">
                  Revenue Risk:
                </span>{" "}
                Two overdue payments totaling{" "}
                <span className="font-semibold text-critical-text">
                  $12,500
                </span>{" "}
                require immediate follow-up.
              </p>
              <p className="mt-3 border-t border-white/10 pt-2.5 text-[11px] text-slate-500">
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
          description="Role-filtered sidebar navigation with active state and real brand mark."
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
