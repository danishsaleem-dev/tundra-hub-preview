-- AlterTable
ALTER TABLE "Prospect" ADD COLUMN     "convertedToAthleteId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_convertedToAthleteId_key" ON "Prospect"("convertedToAthleteId");

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_convertedToAthleteId_fkey" FOREIGN KEY ("convertedToAthleteId") REFERENCES "Athlete"("id") ON DELETE SET NULL ON UPDATE CASCADE;
