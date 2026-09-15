import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PaymentDetailClient } from "./PaymentDetailClient";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { ENTITY_LABELS } from "@/lib/labels";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: `${ENTITY_LABELS.payment.singular} — Tundra Sports Hub`,
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function PaymentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // Mirrors GET /api/payments/[id]'s own identity check (ADMIN: any
  // payment, RECRUITER: only payments whose deal belongs to one of their
  // assigned athletes, everyone else forbidden) — a Payment has no
  // recruiterId of its own, so this is the same two-level nilDeal->
  // athlete->recruiterId lookup the API route itself does.
  if (user?.role === "RECRUITER") {
    const payment = await prisma.payment.findUnique({
      where: { id },
      select: { nilDeal: { select: { athlete: { select: { recruiterId: true } } } } },
    });
    if (!payment || payment.nilDeal.athlete.recruiterId !== user.recruiterId) notFound();
  } else if (user?.role !== "ADMIN") {
    notFound();
  }

  return (
    <AppShell
      title={ENTITY_LABELS.payment.singular}
      role={role}
      user={displayUser ?? undefined}
    >
      <PaymentDetailClient id={id} realRole={user!.role} />
    </AppShell>
  );
}
