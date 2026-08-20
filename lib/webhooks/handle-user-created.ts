import "server-only";
import type { UserJSON } from "@clerk/backend";
import { prisma } from "@/lib/prisma";
import type { InviteMetadata } from "@/lib/invites";

export function isInviteMetadata(value: unknown): value is InviteMetadata {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    (v.role === "ADMIN" || v.role === "RECRUITER" || v.role === "ATHLETE") &&
    (v.recordId === null || typeof v.recordId === "string")
  );
}

export type HandleUserCreatedResult =
  | { status: "created"; role: InviteMetadata["role"] }
  | { status: "skipped"; reason: string };

// Split from the route handler so the write path (parse metadata, create the
// User row, flip the record to ACTIVE) can be exercised directly against a
// real database without needing a signed webhook request to drive it.
export async function handleUserCreated(
  data: UserJSON,
): Promise<HandleUserCreatedResult> {
  const metadata = data.public_metadata;

  if (!isInviteMetadata(metadata)) {
    return { status: "skipped", reason: "no valid invite metadata" };
  }

  const primaryEmail =
    data.email_addresses.find((e) => e.id === data.primary_email_address_id)
      ?.email_address ?? data.email_addresses[0]?.email_address;

  if (!primaryEmail) {
    throw new Error(`user.created for ${data.id} has no email address`);
  }

  const { role, recordId } = metadata;

  await prisma.$transaction(async (tx) => {
    if (role === "ADMIN") {
      await tx.user.upsert({
        where: { clerkUserId: data.id },
        create: { clerkUserId: data.id, role: "ADMIN", email: primaryEmail },
        update: {},
      });
      return;
    }

    if (!recordId) {
      throw new Error(
        `Invite metadata for role ${role} on user ${data.id} is missing recordId`,
      );
    }

    if (role === "RECRUITER") {
      const recruiter = await tx.recruiter.findUnique({ where: { id: recordId } });
      if (!recruiter) {
        throw new Error(`Recruiter ${recordId} not found for invited user ${data.id}`);
      }
      await tx.user.upsert({
        where: { clerkUserId: data.id },
        create: {
          clerkUserId: data.id,
          role: "RECRUITER",
          email: primaryEmail,
          recruiterId: recordId,
        },
        update: {},
      });
      await tx.recruiter.update({
        where: { id: recordId },
        data: { inviteStatus: "ACTIVE" },
      });
      return;
    }

    const athlete = await tx.athlete.findUnique({ where: { id: recordId } });
    if (!athlete) {
      throw new Error(`Athlete ${recordId} not found for invited user ${data.id}`);
    }
    await tx.user.upsert({
      where: { clerkUserId: data.id },
      create: {
        clerkUserId: data.id,
        role: "ATHLETE",
        email: primaryEmail,
        athleteId: recordId,
      },
      update: {},
    });
    await tx.athlete.update({
      where: { id: recordId },
      data: { inviteStatus: "ACTIVE" },
    });
  });

  return { status: "created", role };
}
