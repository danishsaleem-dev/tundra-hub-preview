import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { Panel } from "@/components/Panel";
import { PaymentCreateClient } from "./PaymentCreateClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import { ENTITY_LABELS } from "@/lib/labels";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: `New ${ENTITY_LABELS.payment.singular} — Tundra Sports Hub`,
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function NewPaymentPage() {
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // POST /api/payments (create) is ADMIN-only.
  const body =
    user?.role === "ADMIN" ? (
      <PaymentCreateClient />
    ) : (
      <Panel title={`New ${ENTITY_LABELS.payment.singular}`}>
        <p className="text-sm text-neutral-text">
          This screen is only available to Admins.
        </p>
      </Panel>
    );

  return (
    <AppShell
      title={`New ${ENTITY_LABELS.payment.singular}`}
      role={role}
      user={displayUser ?? undefined}
    >
      {body}
    </AppShell>
  );
}
