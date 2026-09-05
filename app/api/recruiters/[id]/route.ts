import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonValidationError } from "@/lib/api/http";
import { humanizeFieldName } from "@/lib/format";
import {
  recruiterUpdateSchema,
  RECRUITER_SELF_EDITABLE_FIELDS,
} from "@/lib/validation/recruiter";

const SELF_EDITABLE_SHAPE = Object.fromEntries(
  RECRUITER_SELF_EDITABLE_FIELDS.map((field) => [field, true]),
) as Record<(typeof RECRUITER_SELF_EDITABLE_FIELDS)[number], true>;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await params;

  // Deliberately no `archived: false` filter here, unlike the list route —
  // archiving a record must not cut off direct access to it by id, per
  // M5's retrievability requirement. The list route is the only place
  // that hides archived records by default.
  if (user.role === "ADMIN") {
    const recruiter = await prisma.recruiter.findUnique({ where: { id } });
    if (!recruiter) return jsonError("Not found", 404);
    return NextResponse.json({ recruiter });
  }

  if (user.role === "RECRUITER") {
    // A recruiter only ever sees their own record — a mismatched id
    // returns 404, same as if the record didn't exist, rather than
    // revealing that some other recruiter's id is valid.
    if (user.recruiterId !== id) return jsonError("Not found", 404);
    const recruiter = await prisma.recruiter.findUnique({ where: { id } });
    if (!recruiter) return jsonError("Not found", 404);
    return NextResponse.json({ recruiter });
  }

  return jsonError("Forbidden", 403);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await params;

  if (user.role !== "ADMIN" && user.role !== "RECRUITER") {
    return jsonError("Forbidden", 403);
  }

  const raw = await request.json().catch(() => null);
  if (raw === null || typeof raw !== "object") {
    return jsonError("Body must be valid JSON", 400);
  }

  if (user.role === "ADMIN") {
    const result = recruiterUpdateSchema.safeParse(raw);
    if (!result.success) return jsonValidationError(result.error);

    const existing = await prisma.recruiter.findUnique({ where: { id } });
    if (!existing) return jsonError("Not found", 404);

    const recruiter = await prisma.recruiter.update({ where: { id }, data: result.data });
    return NextResponse.json({ recruiter });
  }

  // RECRUITER: own record only, self-editable fields only.
  if (user.recruiterId !== id) return jsonError("Not found", 404);

  const disallowedKeys = Object.keys(raw).filter(
    (key) => !RECRUITER_SELF_EDITABLE_FIELDS.includes(key as never),
  );
  if (disallowedKeys.length > 0) {
    return jsonError(
      `These fields are admin-controlled and cannot be self-edited: ${disallowedKeys.map(humanizeFieldName).join(", ")}`,
      403,
    );
  }

  const result = recruiterUpdateSchema.pick(SELF_EDITABLE_SHAPE).safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  const existing = await prisma.recruiter.findUnique({ where: { id } });
  if (!existing) return jsonError("Not found", 404);

  const recruiter = await prisma.recruiter.update({ where: { id }, data: result.data });
  return NextResponse.json({ recruiter });
}
