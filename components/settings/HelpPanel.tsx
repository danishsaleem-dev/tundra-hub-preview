import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/Badge";
import { Panel } from "@/components/Panel";

const RESOURCES = [
  { title: "How to read your deal dashboard", tag: "Guide" },
  { title: "Understanding NIL compliance requirements", tag: "Compliance" },
  { title: "How payments are tracked and invoiced", tag: "Payments" },
  { title: "How to update your profile", tag: "Account" },
  { title: "System QA guide", tag: "Internal" },
];

export function HelpPanel() {
  return (
    <Panel
      title="Help & Resources"
      description="Guides and support for Tundra Sports Hub"
    >
      <ul className="divide-y divide-card-tint">
        {RESOURCES.map((resource) => (
          <li
            key={resource.title}
            className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
          >
            <button
              type="button"
              className="text-sm font-medium text-brand-blue hover:underline"
            >
              {resource.title}
            </button>
            <div className="flex items-center gap-2.5">
              <Badge label={resource.tag} />
              <ExternalLink className="h-3.5 w-3.5 text-neutral-text" />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-4 rounded-lg bg-page-bg p-3.5 text-sm text-brand-blue">
        Need help? Email{" "}
        <span className="font-semibold">support@tundrasports.com</span> or
        contact your agent directly.
      </div>
    </Panel>
  );
}
