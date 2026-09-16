import { prisma } from "@/lib/prisma";
import { createRestoreHandler } from "@/lib/restore";
import { withAthleteName } from "@/lib/api/http";
import { withComputedPaymentFieldsList } from "@/lib/payment-computed";

const WITH_ATHLETE = { athlete: { select: { athleteName: true } } };

async function findNilDeal(id: string) {
  return prisma.nilDeal.findUnique({
    where: { id },
    include: { payments: true, ...WITH_ATHLETE },
  });
}

// withAthleteName flattens `athlete`; `payments` also needs the same
// computed-fields pass GET/PATCH already run it through, or the Linked
// Payments panel's amountOutstanding renders as "$NaN".
function shapeNilDeal(nilDeal: NonNullable<Awaited<ReturnType<typeof findNilDeal>>>) {
  const { payments, ...rest } = withAthleteName(nilDeal);
  return { ...rest, payments: withComputedPaymentFieldsList(payments) };
}

export const POST = createRestoreHandler({
  entityType: "NIL_DEAL",
  // include + shapeNilDeal, matching restore()'s result below —
  // otherwise `payments`/`athlete`/`athleteName` appear only on one side
  // of the audit diff and log false "changes" (the deal's full payment
  // history among them).
  findById: async (id) => {
    const nilDeal = await findNilDeal(id);
    return nilDeal ? shapeNilDeal(nilDeal) : null;
  },
  restore: async (id) =>
    shapeNilDeal(
      await prisma.nilDeal.update({
        where: { id },
        data: { archived: false },
        include: { payments: true, ...WITH_ATHLETE },
      }),
    ),
  responseKey: "nilDeal",
});
