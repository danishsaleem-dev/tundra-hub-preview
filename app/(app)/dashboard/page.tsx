import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { AdminDashboardContent } from "@/components/dashboards/AdminDashboardContent";
import { RecruiterDashboardContent } from "@/components/dashboards/RecruiterDashboardContent";
import { AthleteDashboardContent } from "@/components/dashboards/AthleteDashboardContent";
import { getCurrentUser, getCurrentDisplayUser, requireAdmin } from "@/lib/auth/current-user";
import { getDashboardSummary, getPaymentHealthList } from "@/lib/dashboard-summary";
import { getActivityFeed } from "@/lib/activity-feed";
import type { Role } from "@/lib/roles";

export const metadata: Metadata = {
  title: "Dashboard — Tundra Sports Hub",
};

const ROLE_MAP: Record<string, Role> = {
  ADMIN: "admin",
  RECRUITER: "recruiter",
  ATHLETE: "athlete",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const displayUser = await getCurrentDisplayUser();
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  // Exactly one dashboard renders — whichever matches the real signed-in
  // user's real role. getDashboardSummary()/getActivityFeed()/
  // getPaymentHealthList() (real, admin-scoped, org-wide financial data)
  // are gated on requireAdmin() itself, not a hand-rolled role check, so
  // this branch shares the same guarantee every admin-only API route
  // does rather than re-deriving it — the same shape as an earlier
  // dashboard RBAC bug, this time backed by the real gate.
  const admin = await requireAdmin();
  const body = admin ? (
    <AdminDashboardContent
      summary={await getDashboardSummary()}
      activity={await getActivityFeed({ recruiterId: null })}
      paymentHealth={await getPaymentHealthList({ recruiterId: null })}
    />
  ) : user?.role === "RECRUITER" ? (
    <RecruiterDashboardContent />
  ) : (
    <AthleteDashboardContent />
  );

  return (
    <AppShell title="Dashboard" role={role} user={displayUser ?? undefined}>
      {body}
    </AppShell>
  );
}
