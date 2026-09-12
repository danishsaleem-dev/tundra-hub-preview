import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { AdminDashboardContent } from "@/components/dashboards/AdminDashboardContent";
import { RecruiterDashboardContent } from "@/components/dashboards/RecruiterDashboardContent";
import { AthleteDashboardContent } from "@/components/dashboards/AthleteDashboardContent";
import { getCurrentUser, getCurrentDisplayUser } from "@/lib/auth/current-user";
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
  // user's real role. There is no client-side way to view another role's
  // dashboard, so getDashboardSummary()/getActivityFeed()/
  // getPaymentHealthList() (real, admin-scoped, org-wide financial data)
  // are only ever reached on the branch that already required user.role
  // === "ADMIN" to get here.
  const body =
    user?.role === "ADMIN" ? (
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
