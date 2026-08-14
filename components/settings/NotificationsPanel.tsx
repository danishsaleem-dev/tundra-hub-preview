import { Panel } from "@/components/Panel";
import { Switch } from "@/components/Switch";

const PREFERENCES = [
  {
    title: "Payment overdue alerts",
    description: "Get notified when invoices go past due",
    defaultOn: true,
  },
  {
    title: "Compliance deadline reminders",
    description: "3-day advance notice for compliance items",
    defaultOn: true,
  },
  {
    title: "New task assignments",
    description: "When a task is assigned to you",
    defaultOn: true,
  },
  {
    title: "Deal status changes",
    description: "When a NIL deal stage changes",
    defaultOn: false,
  },
  {
    title: "Prospect activity",
    description: "Follow-up reminders for prospects",
    defaultOn: true,
  },
  {
    title: "Weekly digest",
    description: "Monday morning summary of open items",
    defaultOn: true,
  },
];

export function NotificationsPanel() {
  return (
    <Panel
      title="Notification Preferences"
      description="Control what you're notified about"
    >
      <ul className="divide-y divide-card-tint">
        {PREFERENCES.map((pref) => (
          <li
            key={pref.title}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <div>
              <p className="text-sm font-semibold text-surface-navy">
                {pref.title}
              </p>
              <p className="mt-0.5 text-xs text-neutral-text">
                {pref.description}
              </p>
            </div>
            <Switch defaultChecked={pref.defaultOn} />
          </li>
        ))}
      </ul>
    </Panel>
  );
}
