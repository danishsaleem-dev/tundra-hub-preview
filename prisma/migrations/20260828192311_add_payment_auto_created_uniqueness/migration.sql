-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "isAutoCreated" BOOLEAN NOT NULL DEFAULT false;

-- Partial unique index: at most one isAutoCreated=true Payment per
-- nilDealId. Deliberately NOT a plain unique constraint on nilDealId —
-- that would also block legitimate multiple manual/installment payments
-- on the same deal. Hand-written here because Prisma 6.12.0's schema DSL
-- (the version this project is pinned to) can't express a partial
-- (WHERE-clause) unique index — that support only landed in Prisma
-- 7.4+/8. See the isAutoCreated field's comment in schema.prisma.
CREATE UNIQUE INDEX "Payment_nilDealId_auto_created_key"
  ON "Payment" ("nilDealId")
  WHERE "isAutoCreated" = true;
