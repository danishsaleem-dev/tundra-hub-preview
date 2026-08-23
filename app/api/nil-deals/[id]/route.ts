import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, jsonValidationError } from "@/lib/api/http";
import { nilDealUpdateSchema } from "@/lib/validation/nil-deal";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);

  const { id } = await params;

  if (user.role === "ADMIN") {
    const nilDeal = await prisma.nilDeal.findUnique({
      where: { id },
      include: { payments: true },
    });
    if (!nilDeal) return jsonError("Not found", 404);
    return NextResponse.json({ nilDeal });
  }

  if (user.role === "RECRUITER") {
    // athlete is fetched only to check scope (recruiterId match) — it's
    // stripped before the response goes out, so the athlete relation never
    // appears in this route's output. athleteId (already a plain scalar
    // on the deal) remains the one way this response points at the
    // athlete; payments remains the one way it points at payments.
    const nilDeal = await prisma.nilDeal.findUnique({
      where: { id },
      include: { payments: true, athlete: { select: { recruiterId: true } } },
    });
    if (!nilDeal || nilDeal.athlete.recruiterId !== user.recruiterId) {
      return jsonError("Not found", 404);
    }
    const { athlete: _athlete, ...rest } = nilDeal;
    return NextResponse.json({ nilDeal: rest });
  }

  return jsonError("Forbidden", 403);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden", 403);

  const { id } = await params;

  const raw = await request.json().catch(() => null);
  if (raw === null) return jsonError("Body must be valid JSON", 400);

  const result = nilDealUpdateSchema.safeParse(raw);
  if (!result.success) return jsonValidationError(result.error);

  const existing = await prisma.nilDeal.findUnique({ where: { id } });
  if (!existing) return jsonError("Not found", 404);

  const nilDeal = await prisma.nilDeal.update({
    where: { id },
    data: result.data,
    include: { payments: true },
  });
  return NextResponse.json({ nilDeal });
}
