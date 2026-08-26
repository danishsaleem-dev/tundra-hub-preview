-- AlterTable
ALTER TABLE "Athlete" ADD COLUMN     "organizationId" TEXT NOT NULL DEFAULT '20a306cd-c81b-43a9-8cde-e788177b4ccd';

-- AlterTable
ALTER TABLE "NilDeal" ADD COLUMN     "organizationId" TEXT NOT NULL DEFAULT '20a306cd-c81b-43a9-8cde-e788177b4ccd';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "organizationId" TEXT NOT NULL DEFAULT '20a306cd-c81b-43a9-8cde-e788177b4ccd';

-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "organizationId" TEXT NOT NULL DEFAULT '20a306cd-c81b-43a9-8cde-e788177b4ccd';

-- AlterTable
ALTER TABLE "Recruiter" ADD COLUMN     "organizationId" TEXT NOT NULL DEFAULT '20a306cd-c81b-43a9-8cde-e788177b4ccd';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "organizationId" TEXT NOT NULL DEFAULT '20a306cd-c81b-43a9-8cde-e788177b4ccd';

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Seed the single Tundra row at the fixed id every organizationId default
-- above points at. Must happen here, before the foreign keys below are
-- added — every existing row on the six tables already carries this
-- literal id via its DEFAULT, so the FK constraints would fail validation
-- against nonexistent data if this row didn't exist yet at that point.
INSERT INTO "Organization" ("id", "name", "createdAt", "updatedAt")
VALUES ('20a306cd-c81b-43a9-8cde-e788177b4ccd', 'Tundra', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recruiter" ADD CONSTRAINT "Recruiter_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilDeal" ADD CONSTRAINT "NilDeal_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
