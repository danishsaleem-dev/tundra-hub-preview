import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/current-user";
import { resendRecordInvite, describeInviteApiError, InviteError, type InvitableRole } from "@/lib/invites";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const recordType: unknown = body?.recordType;
  const recordId: unknown = body?.recordId;

  if (
    (recordType !== "ATHLETE" && recordType !== "RECRUITER") ||
    typeof recordId !== "string" ||
    !recordId
  ) {
    return NextResponse.json(
      { error: "Body must be { recordType: 'ATHLETE' | 'RECRUITER', recordId: string }" },
      { status: 400 },
    );
  }

  try {
    const invitation = await resendRecordInvite(
      recordType as InvitableRole,
      recordId,
      admin.id,
    );
    return NextResponse.json({ invitation });
  } catch (err) {
    if (err instanceof InviteError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("POST /api/admin/invites/resend failed", err);
    return NextResponse.json({ error: describeInviteApiError(err) }, { status: 500 });
  }
}
