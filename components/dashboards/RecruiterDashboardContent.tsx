import { Sparkles } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { Panel } from "@/components/Panel";
import { StatusChip } from "@/components/StatusChip";
import { ListRow } from "@/components/ListRow";
import { DataTable, type Column } from "@/components/DataTable";
import type { StatusVariant } from "@/lib/status";

interface TaskRow {
  title: string;
  priority: StatusVariant;
  priorityLabel: string;
  due: string;
  overdue?: boolean;
}

const TASKS: TaskRow[] = [
  {
    title: "Follow up with Velocity Apparel on overdue Q2 payment",
    priority: "critical",
    priorityLabel: "Critical",
    due: "Overdue",
    overdue: true,
  },
  {
    title: "Review representation agreement draft for DeShawn Tillery",
    priority: "warning",
    priorityLabel: "High",
    due: "Due 2026-05-24",
  },
  {
    title: "Send contract to Isaiah Drummond",
    priority: "warning",
    priorityLabel: "High",
    due: "Due 2026-05-22",
  },
];

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
        <h2 className="text-xl font-bold text-[#0B1330]">
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
        <Panel title="AI Prospect Summary" icon={Sparkles} tone="dark">
          <div className="space-y-2.5 text-xs leading-relaxed text-slate-300">
            <p>
              <span className="font-semibold text-white">
                Isaiah Drummond —
              </span>{" "}
              Contract ready to send. Family aligned, no competing offers
              known. Close this week.
            </p>
            <p>
              <span className="font-semibold text-white">Cameron Osei —</span>{" "}
              Warm. Proposal sent May 14. Follow up with brand offer detail
              to move to contract.
            </p>
            <p>
              <span className="font-semibold text-white">
                Your pipeline health:
              </span>{" "}
              2 hot, 1 warm, 0 cold. On track for monthly close target.
            </p>
          </div>
          <p className="mt-3 border-t border-white/10 pt-2.5 text-[11px] text-slate-500">
            MOCK AI · Tundra Recruiter Intelligence
          </p>
        </Panel>

        <Panel title="My Open Tasks">
          <ul className="divide-y divide-card-tint">
            {TASKS.map((task) => (
              <ListRow
                key={task.title}
                title={task.title}
                accent={task.priority}
                trailing={
                  <>
                    <StatusChip
                      variant={task.priority}
                      label={task.priorityLabel}
                    />
                    <span
                      className={
                        task.overdue
                          ? "text-xs font-medium text-critical-text"
                          : "text-xs text-neutral-text"
                      }
                    >
                      {task.due}
                    </span>
                  </>
                }
              />
            ))}
          </ul>
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
