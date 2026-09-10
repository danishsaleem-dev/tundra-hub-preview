import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { jsonError, jsonValidationError } from "@/lib/api/http";

// Scratch endpoint backing the M5 form/list/detail test harnesses
// (app/(app)/dev-form-test, app/(app)/dev-list-detail-test). POST proves
// the real submit -> Zod validate -> jsonValidationError ->
// inline-field-error pipeline; GET proves the detail view's
// structural-exclusion claim against a real role-scoped API response.
// No persistence either way: neither is a real module, there's nothing
// to store yet. Delete alongside both harnesses once the first real M5
// module exists and can prove the systems for real instead.
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

// Backs the detail-view harness's role-scoped-data proof. internalNotes
// is structurally absent from the response object for non-admin roles —
// not sent as null, not filtered client-side — the exact same shape
// NON_ADMIN_ATHLETE_SELECT already uses for the real Athlete route.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const base = {
    id: "dev-record-1",
    name: "Sample Test Record",
    amount: "500.00",
    dueDate: "2026-12-01",
    notes: "Some notes about this record.\nSecond line.",
    active: true,
    status: "ACTIVE",
  };

  if (user.role !== "ADMIN") {
    return NextResponse.json({ record: base });
  }

  return NextResponse.json({
    record: { ...base, internalNotes: "Admin-only commentary on this record." },
  });
}
