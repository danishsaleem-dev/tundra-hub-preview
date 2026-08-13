import { Button } from "@/components/Button";
import { Panel } from "@/components/Panel";
import { TextField } from "@/components/TextField";

const TWO_FACTOR_METHODS = [
  {
    title: "Authenticator App",
    description: "Use an authenticator app to generate one-time codes",
  },
  {
    title: "SMS Verification",
    description: "Receive a code via text message",
  },
];

export function SecurityPanel() {
  return (
    <div className="space-y-4">
      <Panel
        title="Sign-In & Security"
        description="Manage your password and authentication"
      >
        <div className="space-y-4">
          <TextField
            label="Current Password"
            type="password"
            defaultValue="password123"
          />
          <TextField label="New Password" type="password" />
          <TextField label="Confirm New Password" type="password" />
        </div>
        <Button className="mt-4" size="sm">
          Update Password
        </Button>
      </Panel>

      <Panel
        title="Two-Factor Authentication"
        description="Add an extra layer of security to your account"
      >
        <ul className="divide-y divide-card-tint">
          {TWO_FACTOR_METHODS.map((method) => (
            <li
              key={method.title}
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-semibold text-[#0B1330]">
                  {method.title}
                </p>
                <p className="mt-0.5 text-xs text-neutral-text">
                  {method.description}
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
