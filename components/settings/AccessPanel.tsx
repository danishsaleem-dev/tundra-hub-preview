import { Check } from "lucide-react";
import { Button } from "@/components/Button";
import { Panel } from "@/components/Panel";

const PERMISSIONS = [
  "View all athletes and deals",
  "Manage NIL contracts and payments",
  "Access compliance records",
  "Assign recruiters to athletes/prospects",
  "View and manage System QA",
  "Export data and reports",
  "Manage team member access",
];

export function AccessPanel() {
  return (
    <div className="space-y-4">
      <Panel
        title="Admin Access Level"
        description="Your current role and permissions in the system"
      >
        <div className="rounded-lg bg-card-tint p-4">
          <p className="text-sm font-bold text-surface-navy">Owner / Admin</p>
          <p className="mt-1 text-xs text-neutral-text">
            Full access to all modules, data, and settings. Can manage users,
            view financials, and access System QA.
          </p>
        </div>

        <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-neutral-text">
          Permissions Active
        </p>
        <ul className="mt-2 space-y-2">
          {PERMISSIONS.map((permission) => (
            <li
              key={permission}
              className="flex items-center gap-2 text-sm text-surface-navy"
            >
              <Check className="h-3.5 w-3.5 shrink-0 text-success-text" />
              {permission}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel
        title="Team Access Management"
        description="Invite and manage team member roles"
      >
        <Button size="sm">Invite Team Member</Button>
      </Panel>
    </div>
  );
}
