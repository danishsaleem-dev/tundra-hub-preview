import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { jsonError } from "@/lib/api/http";
import { getActivityFeed } from "@/lib/activity-feed";

// Derived-data feed only — no activity-log table backs this, see
// lib/activity-feed.ts for the full explanation of what each entry type
// actually means and doesn't mean.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  if (user.role !== "ADMIN" && user.role !== "RECRUITER") {
    // Athletes (and anyone else) get nothing here — own-profile view only,
    // no cross-record activity visibility for that role at all.
    return jsonError("Forbidden", 403);
  }

  // null recruiterId means "unscoped" to getActivityFeed (admin visibility),
  // so a RECRUITER-role user with no recruiterId on their own row must be
  // rejected explicitly here rather than falling through to null — that
  // would silently hand a broken account the full admin feed instead of
  // scoping it to nothing.
  if (user.role === "RECRUITER" && !user.recruiterId) {
    return jsonError("Forbidden", 403);
  }

  const items = await getActivityFeed({
    recruiterId: user.role === "RECRUITER" ? user.recruiterId : null,
  });

  return NextResponse.json({ items });
}
