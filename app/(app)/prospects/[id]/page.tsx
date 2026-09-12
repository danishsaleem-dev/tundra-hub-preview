import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProspectDetailClient } from "./ProspectDetailClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { ENTITY_LABELS } from "@/lib/labels";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: `${ENTITY_LABELS.prospect.singular} — Tundra Sports Hub`,
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function ProspectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // Mirrors GET /api/prospects/[id]'s own identity check (ADMIN: any
  // record, RECRUITER: only prospects assigned to them) so a disallowed
  // direct link 404s the same way the API already does. Unlike Recruiter
  // (where "own record" was a direct id comparison against the signed-in
  // user), a Prospect's owner isn't known without reading the row itself
  // — this single-field lookup is that read, not a re-derivation of any
  // real business rule. ProspectDetailClient below still renders exactly
  // whatever the API response body contains.
  if (user?.role === "RECRUITER") {
    const prospect = await prisma.prospect.findUnique({
      where: { id },
      select: { recruiterId: true },
    });
    if (!prospect || prospect.recruiterId !== user.recruiterId) notFound();
  } else if (user?.role !== "ADMIN") {
    notFound();
  }

  return (
    <AppShell
      title={ENTITY_LABELS.prospect.singular}
      role={role}
      user={displayUser ?? undefined}
    >
      <ProspectDetailClient id={id} realRole={user!.role} />
    </AppShell>
  );
}
