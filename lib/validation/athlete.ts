import { z } from "zod";
import {
  Position,
  DominantHand,
  SchoolType,
  AcademicYear,
  TransferPortalStatus,
  RecruitingStatus,
  Tier,
  AthleteFocus,
  ContactMethod,
} from "@prisma/client";

// Only ADMIN creates/updates Athlete records (see route RBAC), so unlike
// Recruiter there's no self-editable subset to carve out here.
//
// AthleteSensitiveInfo (DOB, home address, government ID) is deliberately
// NOT part of this schema — writing that data isn't in scope here, and
// keeping it structurally absent from this schema means there's no field
// on this route that could accidentally accept or echo it back.
export const athleteWritableSchema = z
  .object({
    athleteName: z.string().min(1).max(200),
    preferredName: z.string().max(200).nullable().optional(),

    email: z.string().email().max(320).nullable().optional(),
    phone: z.string().max(30).nullable().optional(),
    city: z.string().max(200).nullable().optional(),
    state: z.string().max(100).nullable().optional(),
    zip: z.string().max(20).nullable().optional(),

    position: z.nativeEnum(Position).nullable().optional(),
    secondaryPositions: z.array(z.nativeEnum(Position)).optional(),
    height: z.string().max(20).nullable().optional(),
    weight: z.number().int().min(0).max(600).nullable().optional(),
    dominantHand: z.nativeEnum(DominantHand).nullable().optional(),
    jerseyNumber: z.number().int().min(0).max(999).nullable().optional(),
    teamName: z.string().max(200).nullable().optional(),

    schoolType: z.nativeEnum(SchoolType).nullable().optional(),
    school: z.string().max(200).nullable().optional(),
    conference: z.string().max(200).nullable().optional(),
    currentAcademicYear: z.nativeEnum(AcademicYear).nullable().optional(),
    eligibilityRemaining: z.string().max(50).nullable().optional(),
    major: z.string().max(200).nullable().optional(),
    gpa: z.number().min(0).max(4.99).nullable().optional(),
    graduationYear: z.number().int().min(1900).max(2100).nullable().optional(),

    transferPortalStatus: z.nativeEnum(TransferPortalStatus).nullable().optional(),
    currentRecruitingStatus: z.nativeEnum(RecruitingStatus).nullable().optional(),
    tier: z.nativeEnum(Tier).nullable().optional(),
    focus: z.nativeEnum(AthleteFocus).nullable().optional(),
    signedDate: z.coerce.date().nullable().optional(),

    recruiterId: z.string().uuid().nullable().optional(),

    // Loosely-typed on purpose — these bundle several sub-fields (film
    // links, offers, socials, NIL preferences) whose exact shape isn't
    // specified anywhere in the schema/ERD, so this validates "a JSON
    // object" without inventing structure that isn't documented.
    recruitingProfile: z.record(z.string(), z.unknown()).nullable().optional(),
    socialProfiles: z.record(z.string(), z.unknown()).nullable().optional(),
    nilPreferences: z.record(z.string(), z.unknown()).nullable().optional(),

    parentGuardianName: z.string().max(200).nullable().optional(),
    parentPhone: z.string().max(30).nullable().optional(),
    parentConsentRequired: z.boolean().nullable().optional(),
    parentConsentReceivedAt: z.coerce.date().nullable().optional(),

    preferredContactMethod: z.nativeEnum(ContactMethod).nullable().optional(),
    communicationNotes: z.string().max(5000).nullable().optional(),
    lastCheckIn: z.coerce.date().nullable().optional(),
    nextCheckIn: z.coerce.date().nullable().optional(),

    intakeStatus: z.string().max(100).nullable().optional(),
    profileComplete: z.boolean().optional(),
  })
  .strict();

export const athleteCreateSchema = athleteWritableSchema;
export const athleteUpdateSchema = athleteWritableSchema.partial();

export type AthleteWritableInput = z.infer<typeof athleteWritableSchema>;
