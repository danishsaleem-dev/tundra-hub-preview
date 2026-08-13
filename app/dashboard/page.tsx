import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { AdminDashboardContent } from "@/components/dashboards/AdminDashboardContent";
import { RecruiterDashboardContent } from "@/components/dashboards/RecruiterDashboardContent";
import { AthleteDashboardContent } from "@/components/dashboards/AthleteDashboardContent";

export const metadata: Metadata = {
  title: "Dashboard — Tundra Sports Hub",
};

export default function DashboardPage() {
  return (
    <AppShell
      title="Dashboard"
      defaultRole="admin"
      content={{
        admin: <AdminDashboardContent />,
        recruiter: <RecruiterDashboardContent />,
        athlete: <AthleteDashboardContent />,
      }}
    />
  );
}
