import { z } from "zod";
import { Position, ProspectStatus, Tier, RepresentationStatus } from "@prisma/client";

// Unlike Recruiter's self-edit, a RECRUITER's update access to their own
// Prospects isn't field-restricted — the restriction here is at the verb
// level (create/archive are admin-only) and the record-scope level (only
// prospects assigned to them), not per-field. So there's a single writable
// schema, used by both roles, rather than a full/self-editable split.
export const prospectWritableSchema = z
  .object({
    fullName: z.string().min(1).max(200),
    email: z.string().email().max(320).nullable().optional(),
    phone: z.string().max(30).nullable().optional(),
    position: z.nativeEnum(Position).nullable().optional(),
    school: z.string().max(200).nullable().optional(),
    classYear: z.string().max(50).nullable().optional(),
    state: z.string().max(100).nullable().optional(),
    parentGuardianName: z.string().max(200).nullable().optional(),
    parentPhone: z.string().max(30).nullable().optional(),
    filmLink: z.string().max(2000).nullable().optional(),
    // Loosely-typed on purpose, same reasoning as Athlete's JSON fields —
    // no documented sub-shape to validate against.
    socialLinks: z.record(z.string(), z.unknown()).nullable().optional(),

    recruiterId: z.string().uuid().nullable().optional(),

    status: z.nativeEnum(ProspectStatus).optional(),
    priorityTier: z.nativeEnum(Tier).nullable().optional(),
    lastContactDate: z.coerce.date().nullable().optional(),
    nextActionDate: z.coerce.date().nullable().optional(),
    nextStep: z.string().max(2000).nullable().optional(),
    knownRepresentationStatus: z.nativeEnum(RepresentationStatus).nullable().optional(),

    scoutingNotes: z.string().max(5000).nullable().optional(),
    evaluationNotes: z.string().max(5000).nullable().optional(),
  })
  .strict();

export const prospectCreateSchema = prospectWritableSchema;
export const prospectUpdateSchema = prospectWritableSchema.partial();

export type ProspectWritableInput = z.infer<typeof prospectWritableSchema>;
