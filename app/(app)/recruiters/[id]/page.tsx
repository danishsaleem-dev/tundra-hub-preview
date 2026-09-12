import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { RecruiterDetailClient } from "./RecruiterDetailClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import { ENTITY_LABELS } from "@/lib/labels";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: `${ENTITY_LABELS.recruiter.singular} — Tundra Sports Hub`,
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function RecruiterDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // Mirrors the identity check GET /api/recruiters/[id] itself enforces
  // (ADMIN: any record, RECRUITER: only their own) so a disallowed direct
  // link 404s the same way the API already does, rather than rendering a
  // client component that just fails its own fetch. This is routing
  // access control, not field-level RBAC — ConfigurableDetail below still
  // renders exactly whatever the API response body contains, nothing
  // re-derived here.
  const canView =
    user?.role === "ADMIN" || (user?.role === "RECRUITER" && user.recruiterId === id);
  if (!canView) notFound();

  return (
    <AppShell
      title={ENTITY_LABELS.recruiter.singular}
      role={role}
      user={displayUser ?? undefined}
    >
      <RecruiterDetailClient id={id} realRole={user!.role} />
    </AppShell>
  );
}
