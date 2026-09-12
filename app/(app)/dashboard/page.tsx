import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { AdminDashboardContent } from "@/components/dashboards/AdminDashboardContent";
import { RecruiterDashboardContent } from "@/components/dashboards/RecruiterDashboardContent";
import { AthleteDashboardContent } from "@/components/dashboards/AthleteDashboardContent";
import { Panel } from "@/components/Panel";
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

  // AppShell's role-preview switcher lets ANY viewer toggle to the admin
  // tab client-side, but this content is resolved server-side up front for
  // all three roles. getDashboardSummary()/getActivityFeed() are real,
  // admin-scoped, org-wide financial data — they must only ever be fetched
  // when the actual signed-in user is ADMIN. A Recruiter or Athlete
  // previewing the admin tab gets a static notice instead, never a live
  // fetch of data their own account isn't allowed to see.
  const adminContent =
    user?.role === "ADMIN" ? (
      <AdminDashboardContent
        summary={await getDashboardSummary()}
        activity={await getActivityFeed({ recruiterId: null })}
        paymentHealth={await getPaymentHealthList({ recruiterId: null })}
      />
    ) : (
      <Panel title="Admin Dashboard">
        <p className="text-sm text-neutral-text">
          This preview tab shows the admin dashboard&apos;s layout only.
          Live data isn&apos;t fetched here — sign in as an admin to see it.
        </p>
      </Panel>
    );

  return (
    <AppShell
      title="Dashboard"
      defaultRole={role}
      user={displayUser ?? undefined}
      content={{
        admin: adminContent,
        recruiter: <RecruiterDashboardContent />,
        athlete: <AthleteDashboardContent />,
      }}
    />
  );
}
