import { z } from "zod";
import { PaymentStatus } from "@prisma/client";

// status is intentionally exactly {PENDING, PARTIAL, PAID} — matching the
// enum as designed. "Overdue" is deliberately NOT a storable status value;
// it's one of the computed fields (see lib/payment-computed.ts), because a
// payment can be PARTIAL and overdue at the same time and cramming both
// into one enum would lose that combination.
export const paymentWritableSchema = z
  .object({
    paymentName: z.string().min(1).max(300),
    nilDealId: z.string().uuid(),
    paymentAmount: z.number().min(0),
    amountPaid: z.number().min(0).optional(),
    dueDate: z.coerce.date().nullable().optional(),
    paymentDate: z.coerce.date().nullable().optional(),
    status: z.nativeEnum(PaymentStatus).optional(),
    invoiceSent: z.boolean().optional(),
    invoiceId: z.string().max(200).nullable().optional(),
    invoiceSentDate: z.coerce.date().nullable().optional(),
    paymentLink: z.string().max(2000).nullable().optional(),
    notes: z.string().max(5000).nullable().optional(),
  })
  .strict();

export const paymentCreateSchema = paymentWritableSchema;
export const paymentUpdateSchema = paymentWritableSchema.partial();

export type PaymentWritableInput = z.infer<typeof paymentWritableSchema>;
