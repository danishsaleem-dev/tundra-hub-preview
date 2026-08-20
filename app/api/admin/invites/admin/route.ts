import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/current-user";
import { createAdminInvite } from "@/lib/invites";

// Separate, simpler path from the record-linked invites: an admin invite
// has no Athlete/Recruiter to check status on or update — role_link_consistency
// requires both link fields to stay null for ADMIN.
export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const email: unknown = body?.email;

  if (typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json(
      { error: "Body must be { email: string }" },
      { status: 400 },
    );
  }

  try {
    const invitation = await createAdminInvite(email);
    return NextResponse.json({ invitation });
  } catch (err) {
    console.error("POST /api/admin/invites/admin failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 },
    );
  }
}
