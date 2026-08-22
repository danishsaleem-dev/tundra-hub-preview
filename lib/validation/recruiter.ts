import { z } from "zod";
import {
  RecruiterStatus,
  AgreementStatus,
  QualityScore,
  IntroductionSource,
} from "@prisma/client";

// Fields a RECRUITER may edit on their own record — their own contact/
// profile info. Everything else (status, qualityScore, performance
// counters, agreementSigned, etc.) is admin-tracked data about the
// recruiter, not something they self-report.
export const RECRUITER_SELF_EDITABLE_FIELDS = [
  "name",
  "phone",
  "email",
  "territory",
  "stateFocus",
] as const;

// Full field set an ADMIN may set on create/update. `archived` is
// deliberately excluded — that's the dedicated archive route's job, not a
// generic field on this schema.
export const recruiterWritableSchema = z
  .object({
    name: z.string().min(1).max(200),
    phone: z.string().max(30).nullable().optional(),
    email: z.string().email().max(320).nullable().optional(),
    territory: z.string().max(200).nullable().optional(),
    stateFocus: z.string().max(100).nullable().optional(),
    status: z.nativeEnum(RecruiterStatus).optional(),
    agreementSigned: z.nativeEnum(AgreementStatus).optional(),
    startDate: z.coerce.date().nullable().optional(),
    paymentTerms: z.string().max(500).nullable().optional(),
    leadsSubmitted: z.number().int().min(0).optional(),
    athletesSigned: z.number().int().min(0).optional(),
    revenueInfluenced: z.number().min(0).nullable().optional(),
    qualityScore: z.nativeEnum(QualityScore).nullable().optional(),
    introductionSource: z.nativeEnum(IntroductionSource).nullable().optional(),
    notes: z.string().max(5000).nullable().optional(),
  })
  .strict();

export const recruiterCreateSchema = recruiterWritableSchema;
export const recruiterUpdateSchema = recruiterWritableSchema.partial();

export type RecruiterSelfEditableField = (typeof RECRUITER_SELF_EDITABLE_FIELDS)[number];
