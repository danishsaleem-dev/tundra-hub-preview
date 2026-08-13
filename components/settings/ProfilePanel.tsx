import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Panel } from "@/components/Panel";
import { TextField } from "@/components/TextField";

export function ProfilePanel() {
  return (
    <div className="space-y-4">
      <Panel
        title="Personal Information"
        description="Your name and contact details as shown in the system"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name="Tundra Admin" size="lg" />
            <div>
              <p className="text-sm font-bold text-[#0B1330]">Tundra Admin</p>
              <p className="text-xs text-neutral-text">
                Admin · Tundra Sports Group
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Change Photo
          </Button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <TextField label="First Name" defaultValue="Tundra" />
          <TextField label="Last Name" defaultValue="Admin" />
          <TextField
            label="Email"
            type="email"
            defaultValue="admin@tundrasports.com"
          />
          <TextField label="Phone" defaultValue="404-555-0112" />
        </div>

        <Button className="mt-4" size="sm">
          Save Changes
        </Button>
      </Panel>

      <Panel
        title="Agency Profile"
        description="Public-facing agency information"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField label="Agency Name" defaultValue="Tundra Sports Group" />
          <TextField
            label="Agency Website"
            defaultValue="www.tundrasportsgroup.com"
          />
        </div>
        <Button className="mt-4" size="sm">
          Save Changes
        </Button>
      </Panel>
    </div>
  );
}
