import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { PaymentsListClient } from "./PaymentsListClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import { ENTITY_LABELS } from "@/lib/labels";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: `${ENTITY_LABELS.payment.plural} — Tundra Sports Hub`,
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function PaymentsPage() {
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // GET /api/payments scopes a RECRUITER to payments for their assigned
  // athletes' deals rather than forbidding the list outright — matches
  // Athlete/Prospect/NilDeal's precedent, both roles render the real
  // list client here.
  const body =
    user?.role === "ADMIN" || user?.role === "RECRUITER" ? (
      <PaymentsListClient realRole={user.role} />
    ) : (
      <Panel title={ENTITY_LABELS.payment.plural}>
        <p className="text-sm text-neutral-text">
          This screen is only available to Admins and Recruiters.
        </p>
      </Panel>
    );

  return (
    <AppShell
      title={ENTITY_LABELS.payment.plural}
      role={role}
      user={displayUser ?? undefined}
    >
      {body}
    </AppShell>
  );
}
