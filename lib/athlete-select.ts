import "server-only";
import { Prisma } from "@prisma/client";
import type { AthleteWritableInput } from "@/lib/validation/athlete";

// Admin sees everything, including the sensitive-info relation (DOB, home
// address, government ID).
export const ADMIN_ATHLETE_INCLUDE = {
  sensitiveInfo: true,
} satisfies Prisma.AthleteInclude;

// Structurally excludes AthleteSensitiveInfo: the relation simply isn't
// named anywhere in this object, so a non-admin query built from this
// select cannot fetch it — there's no "sensitiveInfo: false" line to
// accidentally flip, the field just isn't part of the shape at all. Every
// other Athlete-owned scalar field is safe to return; the sensitive data
// lives entirely in the separate AthleteSensitiveInfo table.
export const NON_ADMIN_ATHLETE_SELECT = {
  id: true,
  athleteName: true,
  preferredName: true,
  email: true,
  phone: true,
  city: true,
  state: true,
  zip: true,
  position: true,
  secondaryPositions: true,
  height: true,
  weight: true,
  dominantHand: true,
  jerseyNumber: true,
  teamName: true,
  schoolType: true,
  school: true,
  conference: true,
  currentAcademicYear: true,
  eligibilityRemaining: true,
  major: true,
  gpa: true,
  graduationYear: true,
  transferPortalStatus: true,
  currentRecruitingStatus: true,
  tier: true,
  focus: true,
  signedDate: true,
  recruiterId: true,
  recruitingProfile: true,
  socialProfiles: true,
  nilPreferences: true,
  parentGuardianName: true,
  parentPhone: true,
  parentConsentRequired: true,
  parentConsentReceivedAt: true,
  parentConsentRecordedBy: true,
  preferredContactMethod: true,
  communicationNotes: true,
  lastCheckIn: true,
  nextCheckIn: true,
  intakeStatus: true,
  profileComplete: true,
  archived: true,
  createdAt: true,
  updatedAt: true,
  inviteStatus: true,
  clerkInvitationId: true,
  invitedAt: true,
  invitedBy: true,
} satisfies Prisma.AthleteSelect;

// Prisma treats a JSON column's `null` as ambiguous (leave untouched? set
// SQL NULL? set the JSON literal null?) and rejects a bare `null` for
// these fields — it wants the Prisma.JsonNull sentinel instead. Zod's
// output uses plain `null`, so this bridges the two right before the
// value reaches Prisma, in one place instead of at every call site.
export function toAthletePrismaData(
  data: Partial<AthleteWritableInput>,
): Prisma.AthleteUncheckedCreateInput & Prisma.AthleteUncheckedUpdateInput {
  return {
    ...data,
    recruitingProfile: data.recruitingProfile === null ? Prisma.JsonNull : data.recruitingProfile,
    socialProfiles: data.socialProfiles === null ? Prisma.JsonNull : data.socialProfiles,
    nilPreferences: data.nilPreferences === null ? Prisma.JsonNull : data.nilPreferences,
  } as Prisma.AthleteUncheckedCreateInput & Prisma.AthleteUncheckedUpdateInput;
}
