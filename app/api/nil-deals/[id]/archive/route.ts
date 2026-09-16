import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { jsonError, withAthleteName } from "@/lib/api/http";
import { withComputedPaymentFieldsList } from "@/lib/payment-computed";
import { logAudit } from "@/lib/audit-log";

const WITH_ATHLETE = { athlete: { select: { athleteName: true } } };

// Admin-only — a Recruiter has read-only access to NIL Deals for their
// assigned athletes, no write access at all (not even update), so archive
// is exclusively an admin action here.
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("Unauthorized", 401);
  if (user.role !== "ADMIN") return jsonError("Forbidden", 403);

  const { id } = await params;

  // include, matching the update result below — a plain findUnique here
  // would make `payments` appear only on the "after" side of the audit
  // diff and log the deal's full payment history as a false "change".
  const existing = await prisma.nilDeal.findUnique({
    where: { id },
    include: { payments: true, ...WITH_ATHLETE },
  });
  if (!existing) return jsonError("Not found", 404);

  const nilDeal = await prisma.nilDeal.update({
    where: { id },
    data: { archived: true },
    include: { payments: true, ...WITH_ATHLETE },
  });

  await logAudit({
    actor: { id: user.id, role: user.role },
    action: "ARCHIVE",
    entityType: "NIL_DEAL",
    entityId: id,
    before: existing,
    after: nilDeal,
  });

  // withAthleteName flattens `athlete`, but its `payments` still needs
  // the same computed-fields pass GET/PATCH already run it through —
  // otherwise the Linked Payments panel's amountOutstanding renders as
  // "$NaN" for a moment (the raw Decimal fields with no derived value).
  const { payments, ...rest } = withAthleteName(nilDeal);
  return NextResponse.json({
    nilDeal: { ...rest, payments: withComputedPaymentFieldsList(payments) },
  });
}
