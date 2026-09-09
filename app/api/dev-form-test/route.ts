import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { jsonError, jsonValidationError } from "@/lib/api/http";

// Scratch validation endpoint backing the M5 Day 1 form-system test
// harness (app/(app)/dev-form-test) — proves the real
// submit -> Zod validate -> jsonValidationError -> inline-field-error
// pipeline end to end. No persistence: this isn't a real module, there's
// nothing to store yet. Delete alongside the harness once the first real
// M5 module exists and can prove the system for real instead.
const devFormTestSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100),
    amount: z.union([z.number(), z.literal("")]).optional(),
    dueDate: z.string().optional(),
    notes: z.string().max(1000).optional(),
    active: z.boolean().optional(),
    status: z.enum(["DRAFT", "ACTIVE", "DONE"]),
    tags: z.array(z.enum(["A", "B", "C"])).optional(),
    internalScore: z.union([z.number(), z.literal("")]).optional(),
  })
  .strict();

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const raw = await request.json().catch(() => null);
  if (raw === null || typeof raw !== "object") {
    return jsonError("Body must be valid JSON", 400);
  }

  // Same disallowed-field defense-in-depth as Athlete/Recruiter
  // self-service — internalScore only ever appears in the body at all if
  // a non-admin role bypassed the UI, since ConfigurableForm never
  // renders it for them in the first place.
  if ("internalScore" in raw && user.role !== "ADMIN") {
    return jsonError("internalScore is not editable by this role", 403);
  }

  const result = devFormTestSchema.safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  return NextResponse.json({ result: result.data });
}
