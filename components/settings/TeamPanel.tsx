import { Avatar } from "@/components/Avatar";
import { Panel } from "@/components/Panel";
import { cn } from "@/lib/cn";

interface Member {
  name: string;
  email: string;
  role: "Admin / Owner" | "Recruiter";
}

const MEMBERS: Member[] = [
  {
    name: "Tundra Admin",
    email: "admin@tundrasports.com",
    role: "Admin / Owner",
  },
  { name: "Marcus Webb", email: "mwebb@tundrasports.com", role: "Recruiter" },
  {
    name: "Darnell Okafor",
    email: "dokafor@tundrasports.com",
    role: "Recruiter",
  },
  {
    name: "Jordan Pierce",
    email: "jpierce@tundrasports.com",
    role: "Recruiter",
  },
  {
    name: "Tyrese Harmon",
    email: "tharmon@tundrasports.com",
    role: "Recruiter",
  },
  {
    name: "Aaliyah Simmons",
    email: "asimmons@tundrasports.com",
    role: "Recruiter",
  },
];

function RoleBadge({ role }: { role: Member["role"] }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        role === "Admin / Owner"
          ? "bg-surface-navy text-white"
          : "border border-brand-blue/30 text-brand-blue",
      )}
    >
      {role}
    </span>
  );
}

export function TeamPanel() {
  return (
    <Panel
      title="Team Members"
      description="All users with access to Tundra Sports Hub"
    >
      <ul className="divide-y divide-card-tint">
        {MEMBERS.map((member) => (
          <li
            key={member.email}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-2.5">
              <Avatar name={member.name} />
              <div>
                <p className="text-sm font-semibold text-surface-navy">
                  {member.name}
                </p>
                <p className="text-xs text-neutral-text">{member.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <RoleBadge role={member.role} />
              <button
                type="button"
                className="text-xs font-medium text-neutral-text hover:text-brand-blue"
              >
                Manage
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
