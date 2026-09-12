import { Sparkles, ListTodo } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { Panel } from "@/components/Panel";
import { StatusChip } from "@/components/StatusChip";
import { EmptyState } from "@/components/EmptyState";
import { DataTable, type Column } from "@/components/DataTable";
import type { StatusVariant } from "@/lib/status";

interface ProspectRow {
  prospect: string;
  position: string;
  school: string;
  stage: StatusVariant;
  stageLabel: string;
  strength: StatusVariant;
  strengthLabel: string;
  nextFollowUp: string;
}

const PROSPECTS: ProspectRow[] = [
  {
    prospect: "Isaiah Drummond",
    position: "QB",
    school: "Buford High School",
    stage: "success",
    stageLabel: "Contract Sent",
    strength: "critical",
    strengthLabel: "Hot",
    nextFollowUp: "2026-05-22",
  },
  {
    prospect: "Cameron Osei",
    position: "WR",
    school: "Grayson High School",
    stage: "neutral",
    stageLabel: "Proposal Sent",
    strength: "warning",
    strengthLabel: "Warm",
    nextFollowUp: "2026-05-24",
  },
  {
    prospect: "Elijah Moss",
    position: "OT",
    school: "North Gwinnett High",
    stage: "neutral",
    stageLabel: "Initial Contact",
    strength: "warning",
    strengthLabel: "Warm",
    nextFollowUp: "2026-05-28",
  },
];

const PROSPECT_COLUMNS: Column<ProspectRow>[] = [
  { key: "prospect", header: "Prospect", render: (row) => row.prospect },
  { key: "position", header: "Position", render: (row) => row.position },
  { key: "school", header: "School", render: (row) => row.school },
  {
    key: "stage",
    header: "Stage",
    render: (row) => (
      <StatusChip variant={row.stage} label={row.stageLabel} />
    ),
  },
  {
    key: "strength",
    header: "Strength",
    render: (row) => (
      <StatusChip variant={row.strength} label={row.strengthLabel} />
    ),
  },
  {
    key: "nextFollowUp",
    header: "Next Follow-Up",
    align: "right",
    render: (row) => row.nextFollowUp,
  },
];

export function RecruiterDashboardContent() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-surface-navy">
          Good morning, Marcus
        </h2>
        <p className="mt-1 text-xs text-neutral-text">
          May 19, 2026 · Georgia Region
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          accent="brand"
          label="My Prospects"
          value="3"
          subtext="2 in final stage"
        />
        <KpiCard
          accent="brand"
          label="My Athletes"
          value="2"
          subtext="All active"
        />
        <KpiCard
          accent="critical"
          label="Open Tasks"
          value="3"
          subtext="2 overdue"
        />
        <KpiCard
          accent="success"
          label="Follow-Ups Today"
          value="2"
          subtext="Isaiah + Tillery"
        />
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Panel title="AI Prospect Summary" icon={Sparkles}>
          <EmptyState
            icon={Sparkles}
            title="AI insights not yet available"
            description="Prospect summary generation isn't built yet — this becomes available once it ships."
          />
        </Panel>

        <Panel title="My Open Tasks">
          <EmptyState
            icon={ListTodo}
            title="No tasks yet"
            description="Task tracking isn't built yet — this becomes available once the Tasks module ships."
          />
        </Panel>
      </div>

      <Panel title="My Prospect Pipeline">
        <DataTable
          columns={PROSPECT_COLUMNS}
          rows={PROSPECTS}
          rowKey={(row) => row.prospect}
        />
      </Panel>
    </div>
  );
}
