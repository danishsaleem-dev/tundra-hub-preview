import { z } from "zod";

// Admin-only, deliberately separate from athleteWritableSchema — this is
// the one place Government ID, DOB, and home address can be written at
// all. Keeping it its own schema/route (rather than folding these fields
// into the general Athlete update) means there's exactly one code path
// that ever touches this table, matching the "structurally separated"
// design already documented on the AthleteSensitiveInfo model itself.
export const athleteSensitiveInfoWritableSchema = z
  .object({
    dateOfBirth: z.coerce.date().nullable().optional(),
    homeAddress: z.string().max(500).nullable().optional(),
    governmentIdUrl: z.string().max(2000).nullable().optional(),
  })
  .strict();

export type AthleteSensitiveInfoWritableInput = z.infer<
  typeof athleteSensitiveInfoWritableSchema
>;
