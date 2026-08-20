import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { AdminDashboardContent } from "@/components/dashboards/AdminDashboardContent";
import { RecruiterDashboardContent } from "@/components/dashboards/RecruiterDashboardContent";
import { AthleteDashboardContent } from "@/components/dashboards/AthleteDashboardContent";
import { getCurrentUser } from "@/lib/auth/current-user";
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
  const role = (user ? ROLE_MAP[user.role] : undefined) ?? "admin";

  return (
    <AppShell
      title="Dashboard"
      defaultRole={role}
      content={{
        admin: <AdminDashboardContent />,
        recruiter: <RecruiterDashboardContent />,
        athlete: <AthleteDashboardContent />,
      }}
    />
  );
}
