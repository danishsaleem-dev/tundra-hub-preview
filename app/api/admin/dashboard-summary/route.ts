import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/current-user";
import { getDashboardSummary } from "@/lib/dashboard-summary";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const summary = await getDashboardSummary();
  return NextResponse.json(summary);
}
