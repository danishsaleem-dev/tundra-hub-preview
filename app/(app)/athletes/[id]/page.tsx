import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AthleteDetailClient } from "./AthleteDetailClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { ENTITY_LABELS } from "@/lib/labels";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: `${ENTITY_LABELS.athlete.singular} — Tundra Sports Hub`,
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function AthleteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // This is the admin-facing management screen — an ATHLETE never lands
  // here, even for their own record; that's the separate, unmodified M4
  // self-service screen at /my-profile. So unlike the API's own GET
  // (which does let an ATHLETE fetch their own record), the page-level
  // gate here is narrower: ADMIN (any athlete) or RECRUITER (only their
  // assigned athletes, via the one-field lookup below, mirroring the
  // same identity check the API itself makes) — everything else 404s,
  // same pattern as Recruiter/Prospect's detail pages.
  if (user?.role === "RECRUITER") {
    const athlete = await prisma.athlete.findUnique({
      where: { id },
      select: { recruiterId: true },
    });
    if (!athlete || athlete.recruiterId !== user.recruiterId) notFound();
  } else if (user?.role !== "ADMIN") {
    notFound();
  }

  return (
    <AppShell
      title={ENTITY_LABELS.athlete.singular}
      role={role}
      user={displayUser ?? undefined}
    >
      <AthleteDetailClient id={id} realRole={user!.role} />
    </AppShell>
  );
}
