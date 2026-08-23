import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api/http";

// Admin-only, same as Recruiter/Athlete archive — a Recruiter can update
// their own Prospects but not archive them.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden", 403);

  const { id } = await params;

  const existing = await prisma.prospect.findUnique({ where: { id } });
  if (!existing) return jsonError("Not found", 404);

  const prospect = await prisma.prospect.update({
    where: { id },
    data: { archived: true },
  });
  return NextResponse.json({ prospect });
}
