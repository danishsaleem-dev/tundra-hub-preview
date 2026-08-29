import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonValidationError } from "@/lib/api/http";
import { athleteSensitiveInfoWritableSchema } from "@/lib/validation/athlete-sensitive-info";

// Admin-only, and deliberately its own route rather than folded into the
// general Athlete PATCH — this is the one and only path that ever writes
// Government ID, DOB, or home address. Create-or-update (upsert): a
// freshly created Athlete has no AthleteSensitiveInfo row at all until an
// admin sets one here.
//
// governmentIdUrl is stored here as a plain string reference only — the
// actual file upload and encryption mechanism is separate, unbuilt
// infrastructure, explicitly out of scope for this route.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden", 403);

  const { id } = await params;

  const athlete = await prisma.athlete.findUnique({ where: { id } });
  if (!athlete) return jsonError("Not found", 404);

  const raw = await request.json().catch(() => null);
  if (raw === null) return jsonError("Body must be valid JSON", 400);

  const result = athleteSensitiveInfoWritableSchema.safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  // The access log's existing action vocabulary (VIEW_GOVERNMENT_ID,
  // VIEW_DOB, VIEW_ADDRESS) was written for reads. WRITE_SENSITIVE_INFO is
  // the write-specific counterpart — one row per write call, same
  // accountability standard as a read, in the same transaction as the
  // actual write so the two can't drift (a logged write that didn't
  // happen, or a write with no record of who made it).
  const [sensitiveInfo] = await prisma.$transaction([
    prisma.athleteSensitiveInfo.upsert({
      where: { athleteId: id },
      create: { athleteId: id, ...result.data },
      update: result.data,
    }),
    prisma.athleteSensitiveInfoAccessLog.create({
      data: {
        athleteId: id,
        accessedBy: user.id,
        action: "WRITE_SENSITIVE_INFO",
      },
    }),
  ]);

  return NextResponse.json({ sensitiveInfo });
}
