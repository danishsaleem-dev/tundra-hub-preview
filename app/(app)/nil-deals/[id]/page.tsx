import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { NilDealDetailClient } from "./NilDealDetailClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { ENTITY_LABELS } from "@/lib/labels";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: `${ENTITY_LABELS.nilDeal.singular} — Tundra Sports Hub`,
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function NilDealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // Mirrors GET /api/nil-deals/[id]'s own identity check (ADMIN: any
  // deal, RECRUITER: only deals for athletes assigned to them, everyone
  // else forbidden) — a NilDeal has no recruiterId of its own, so this
  // is the same two-level athlete->recruiterId lookup the API route
  // itself does, not a re-derivation of any different rule.
  if (user?.role === "RECRUITER") {
    const nilDeal = await prisma.nilDeal.findUnique({
      where: { id },
      select: { athlete: { select: { recruiterId: true } } },
    });
    if (!nilDeal || nilDeal.athlete.recruiterId !== user.recruiterId) notFound();
  } else if (user?.role !== "ADMIN") {
    notFound();
  }

  return (
    <AppShell
      title={ENTITY_LABELS.nilDeal.singular}
      role={role}
      user={displayUser ?? undefined}
    >
      <NilDealDetailClient id={id} realRole={user!.role} />
    </AppShell>
  );
}
