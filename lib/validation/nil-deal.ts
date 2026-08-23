import { z } from "zod";
import { DealType, ContractStatus, DisclosureStatus, PaymentStructure } from "@prisma/client";

export const nilDealWritableSchema = z
  .object({
    dealName: z.string().min(1).max(300),
    athleteId: z.string().uuid(),
    brandName: z.string().max(300).nullable().optional(),
    dealType: z.nativeEnum(DealType).nullable().optional(),
    dealValue: z.number().min(0).nullable().optional(),
    agencyFee: z.number().min(0).nullable().optional(),
    athleteNet: z.number().min(0).nullable().optional(),
    deliverables: z.string().max(5000).nullable().optional(),
    contractStatus: z.nativeEnum(ContractStatus).optional(),
    schoolDisclosure: z.nativeEnum(DisclosureStatus).nullable().optional(),
    ftcGuidanceSent: z.boolean().optional(),
    paymentStructure: z.nativeEnum(PaymentStructure).nullable().optional(),
    deadline: z.coerce.date().nullable().optional(),
    notes: z.string().max(5000).nullable().optional(),
  })
  .strict();

// Payments are deliberately NOT part of this schema — Payment CRUD isn't in
// scope here, and the deal's relationship to its payments is exposed only
// via the `payments` relation array on GET responses (see the route
// handlers), never as a parallel/flattened field on the deal itself. That's
// the one clear way this API represents deal-to-payment linkage.
export const nilDealCreateSchema = nilDealWritableSchema;
export const nilDealUpdateSchema = nilDealWritableSchema.partial();
