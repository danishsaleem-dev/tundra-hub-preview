import "server-only";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

// Role determines which table an invite links to — RECRUITER and ATHLETE
// always link to an existing record (never create one; the record is the
// source of truth per the invite-flow decision). ADMIN never links to a
// record at all, matching role_link_consistency.
export type InvitableRole = "ATHLETE" | "RECRUITER";

// Shape stored on the Clerk invitation's publicMetadata. Clerk copies this
// onto the created User's public_metadata at signup time — that's how the
// webhook (and the temporary "no account found" screen) knows which role
// and which record this account belongs to, without the invitation record
// itself remaining queryable at that point in the flow.
export interface InviteMetadata {
  role: InvitableRole | "ADMIN";
  recordId: string | null;
}

export class InviteError extends Error {
  constructor(
    message: string,
    public readonly status: number = 400,
  ) {
    super(message);
  }
}

function modelFor(role: InvitableRole) {
  return role === "ATHLETE" ? prisma.athlete : prisma.recruiter;
}

async function findRecord(role: InvitableRole, recordId: string) {
  const model = modelFor(role);
  // @ts-expect-error -- findUnique's return type differs per model, but the
  // fields this module reads (id/email/inviteStatus/clerkInvitationId) are
  // common to both.
  const record = await model.findUnique({ where: { id: recordId } });
  if (!record) {
    throw new InviteError(
      `${role === "ATHLETE" ? "Athlete" : "Recruiter"} ${recordId} not found`,
      404,
    );
  }
  return record as {
    id: string;
    email: string | null;
    inviteStatus: "NOT_INVITED" | "PENDING" | "ACTIVE";
    clerkInvitationId: string | null;
  };
}

export async function createRecordInvite(
  role: InvitableRole,
  recordId: string,
  adminUserId: string,
) {
  const record = await findRecord(role, recordId);

  if (record.inviteStatus === "PENDING" || record.inviteStatus === "ACTIVE") {
    throw new InviteError(
      `This record is already ${record.inviteStatus.toLowerCase()} — use resend instead of inviting again`,
      409,
    );
  }
  if (!record.email) {
    throw new InviteError(
      "This record has no email address on file — add one before inviting",
      422,
    );
  }

  const client = await clerkClient();
  const invitation = await client.invitations.createInvitation({
    emailAddress: record.email,
    publicMetadata: { role, recordId } satisfies InviteMetadata,
  });

  const model = modelFor(role);
  // @ts-expect-error -- see findRecord
  await model.update({
    where: { id: recordId },
    data: {
      inviteStatus: "PENDING",
      clerkInvitationId: invitation.id,
      invitedAt: new Date(),
      invitedBy: adminUserId,
    },
  });

  return invitation;
}

export async function resendRecordInvite(
  role: InvitableRole,
  recordId: string,
  adminUserId: string,
) {
  const record = await findRecord(role, recordId);

  if (record.inviteStatus === "ACTIVE") {
    throw new InviteError(
      "This record already has an active account — nothing to resend",
      409,
    );
  }
  if (!record.email) {
    throw new InviteError(
      "This record has no email address on file — add one before inviting",
      422,
    );
  }

  const client = await clerkClient();

  // Clerk rejects a new invitation while a prior one for the same email is
  // still pending, so revoke the stored invitation first. Best-effort: an
  // already-revoked or expired invitation throws here too, and that's fine
  // — the point is just to clear the way for the new one.
  if (record.clerkInvitationId) {
    try {
      await client.invitations.revokeInvitation(record.clerkInvitationId);
    } catch {
      // already revoked/expired/accepted — ignore and proceed
    }
  }

  const invitation = await client.invitations.createInvitation({
    emailAddress: record.email,
    publicMetadata: { role, recordId } satisfies InviteMetadata,
    ignoreExisting: true,
  });

  const model = modelFor(role);
  // @ts-expect-error -- see findRecord
  await model.update({
    where: { id: recordId },
    data: {
      inviteStatus: "PENDING",
      clerkInvitationId: invitation.id,
      invitedAt: new Date(),
      invitedBy: adminUserId,
    },
  });

  return invitation;
}

export async function revokeRecordInvite(role: InvitableRole, recordId: string) {
  const record = await findRecord(role, recordId);

  if (!record.clerkInvitationId) {
    throw new InviteError("This record has no active invitation to revoke", 409);
  }

  const client = await clerkClient();
  try {
    await client.invitations.revokeInvitation(record.clerkInvitationId);
  } catch (err) {
    // Clerk 400s if the invitation was already accepted/revoked/expired —
    // in every one of those cases the invitation is no longer "live" from
    // our side either, so still reset local status rather than surfacing
    // an error for a state the admin can't do anything about.
    void err;
  }

  const model = modelFor(role);
  // @ts-expect-error -- see findRecord
  await model.update({
    where: { id: recordId },
    data: {
      inviteStatus: "NOT_INVITED",
      clerkInvitationId: null,
      invitedAt: null,
      invitedBy: null,
    },
  });
}

// Admin invites are deliberately their own path: no record, no inviteStatus
// to flip, no linkage at all — role_link_consistency requires both
// athleteId and recruiterId to be null for ADMIN.
export async function createAdminInvite(email: string) {
  const client = await clerkClient();
  return client.invitations.createInvitation({
    emailAddress: email,
    publicMetadata: { role: "ADMIN", recordId: null } satisfies InviteMetadata,
  });
}
