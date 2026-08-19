-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'RECRUITER', 'ATHLETE');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('QB', 'WR', 'RB', 'TE', 'OL', 'DL', 'LB', 'DB', 'K_P');

-- CreateEnum
CREATE TYPE "DominantHand" AS ENUM ('RIGHT', 'LEFT', 'AMBIDEXTROUS');

-- CreateEnum
CREATE TYPE "SchoolType" AS ENUM ('HIGH_SCHOOL', 'COLLEGE', 'JUNIOR_COLLEGE', 'PREP_SCHOOL', 'PRO');

-- CreateEnum
CREATE TYPE "AcademicYear" AS ENUM ('FRESHMAN', 'SOPHOMORE', 'JUNIOR', 'SENIOR', 'GRADUATE', 'POSTGRADUATE', 'NOT_APPLICABLE');

-- CreateEnum
CREATE TYPE "TransferPortalStatus" AS ENUM ('NOT_APPLICABLE', 'NOT_IN_PORTAL', 'CONSIDERING', 'IN_PORTAL', 'TRANSFERRED');

-- CreateEnum
CREATE TYPE "RecruitingStatus" AS ENUM ('UNCOMMITTED', 'COMMITTED', 'ACTIVELY_RECRUITED', 'LIGHT_INTEREST', 'SIGNED', 'PORTAL', 'PRO');

-- CreateEnum
CREATE TYPE "Tier" AS ENUM ('TIER_A', 'TIER_B', 'TIER_C');

-- CreateEnum
CREATE TYPE "AthleteFocus" AS ENUM ('NIL', 'FOOTBALL', 'BOTH');

-- CreateEnum
CREATE TYPE "ContactMethod" AS ENUM ('TEXT', 'CALL', 'EMAIL');

-- CreateEnum
CREATE TYPE "ProspectStatus" AS ENUM ('NEW_LEAD', 'FILM_REVIEW', 'INTRO_CALL_SCHEDULED', 'FAMILY_CALL_SCHEDULED', 'EVALUATING', 'OFFER_EXTENDED', 'AGREEMENT_SENT', 'SIGNED', 'LOST', 'NURTURE');

-- CreateEnum
CREATE TYPE "RepresentationStatus" AS ENUM ('NONE', 'PARENT_LED', 'ADVISOR', 'MARKETING_REP', 'AGENT', 'ATTORNEY', 'COLLECTIVE_CONNECTED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('NIL_DEAL', 'APPEARANCE', 'AUTOGRAPH_SIGNING', 'CAMP_CLINIC', 'BRAND_AMBASSADOR', 'SOCIAL_MEDIA_CAMPAIGN', 'COMMERCIAL', 'EVENT_PARTNERSHIP', 'PRODUCT_GIFTING', 'CONTENT_COLLABORATION', 'SPEAKING_PANEL', 'OTHER');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFTING', 'SENT', 'SIGNED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "DisclosureStatus" AS ENUM ('REQUIRED', 'SUBMITTED', 'NOT_REQUIRED');

-- CreateEnum
CREATE TYPE "PaymentStructure" AS ENUM ('LUMP_SUM', 'INSTALLMENTS');

-- CreateEnum
CREATE TYPE "RecruiterStatus" AS ENUM ('ACTIVE', 'VETTING', 'PAUSED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('YES', 'NO', 'PENDING');

-- CreateEnum
CREATE TYPE "QualityScore" AS ENUM ('A', 'B', 'C');

-- CreateEnum
CREATE TYPE "IntroductionSource" AS ENUM ('DIRECT', 'REFERRED_BY_ATHLETE', 'REFERRED_BY_RECRUITER', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "athleteId" TEXT,
    "recruiterId" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recruiter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "territory" TEXT,
    "stateFocus" TEXT,
    "status" "RecruiterStatus" NOT NULL DEFAULT 'VETTING',
    "agreementSigned" "AgreementStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3),
    "paymentTerms" TEXT,
    "leadsSubmitted" INTEGER NOT NULL DEFAULT 0,
    "athletesSigned" INTEGER NOT NULL DEFAULT 0,
    "revenueInfluenced" DECIMAL(12,2),
    "qualityScore" "QualityScore",
    "introductionSource" "IntroductionSource",
    "notes" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Recruiter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Athlete" (
    "id" TEXT NOT NULL,
    "athleteName" TEXT NOT NULL,
    "preferredName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "position" "Position",
    "secondaryPositions" "Position"[],
    "height" TEXT,
    "weight" INTEGER,
    "dominantHand" "DominantHand",
    "jerseyNumber" INTEGER,
    "teamName" TEXT,
    "schoolType" "SchoolType",
    "school" TEXT,
    "conference" TEXT,
    "currentAcademicYear" "AcademicYear",
    "eligibilityRemaining" TEXT,
    "major" TEXT,
    "gpa" DECIMAL(3,2),
    "graduationYear" INTEGER,
    "transferPortalStatus" "TransferPortalStatus",
    "currentRecruitingStatus" "RecruitingStatus",
    "tier" "Tier",
    "focus" "AthleteFocus",
    "signedDate" TIMESTAMP(3),
    "recruiterId" TEXT,
    "recruitingProfile" JSONB,
    "socialProfiles" JSONB,
    "nilPreferences" JSONB,
    "parentGuardianName" TEXT,
    "parentPhone" TEXT,
    "parentConsentRequired" BOOLEAN DEFAULT false,
    "parentConsentReceivedAt" TIMESTAMP(3),
    "parentConsentRecordedBy" TEXT,
    "preferredContactMethod" "ContactMethod",
    "communicationNotes" TEXT,
    "lastCheckIn" TIMESTAMP(3),
    "nextCheckIn" TIMESTAMP(3),
    "intakeStatus" TEXT,
    "profileComplete" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Athlete_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AthleteSensitiveInfo" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "homeAddress" TEXT,
    "governmentIdUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AthleteSensitiveInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AthleteSensitiveInfoAccessLog" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "accessedBy" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "accessedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AthleteSensitiveInfoAccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "relationship" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "position" "Position",
    "school" TEXT,
    "classYear" TEXT,
    "state" TEXT,
    "parentGuardianName" TEXT,
    "parentPhone" TEXT,
    "filmLink" TEXT,
    "socialLinks" JSONB,
    "recruiterId" TEXT,
    "status" "ProspectStatus" NOT NULL DEFAULT 'NEW_LEAD',
    "priorityTier" "Tier",
    "lastContactDate" TIMESTAMP(3),
    "nextActionDate" TIMESTAMP(3),
    "nextStep" TEXT,
    "knownRepresentationStatus" "RepresentationStatus",
    "scoutingNotes" TEXT,
    "evaluationNotes" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NilDeal" (
    "id" TEXT NOT NULL,
    "dealName" TEXT NOT NULL,
    "athleteId" TEXT NOT NULL,
    "brandName" TEXT,
    "dealType" "DealType",
    "dealValue" DECIMAL(12,2),
    "agencyFee" DECIMAL(12,2),
    "athleteNet" DECIMAL(12,2),
    "deliverables" TEXT,
    "contractStatus" "ContractStatus" NOT NULL DEFAULT 'DRAFTING',
    "schoolDisclosure" "DisclosureStatus",
    "ftcGuidanceSent" BOOLEAN NOT NULL DEFAULT false,
    "paymentStructure" "PaymentStructure",
    "deadline" TIMESTAMP(3),
    "notes" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NilDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "paymentName" TEXT NOT NULL,
    "nilDealId" TEXT NOT NULL,
    "paymentAmount" DECIMAL(12,2) NOT NULL,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "paymentDate" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "invoiceSent" BOOLEAN NOT NULL DEFAULT false,
    "invoiceId" TEXT,
    "invoiceSentDate" TIMESTAMP(3),
    "paymentLink" TEXT,
    "notes" TEXT,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_clerkUserId_key" ON "User"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_athleteId_key" ON "User"("athleteId");

-- CreateIndex
CREATE UNIQUE INDEX "User_recruiterId_key" ON "User"("recruiterId");

-- CreateIndex
CREATE UNIQUE INDEX "AthleteSensitiveInfo_athleteId_key" ON "AthleteSensitiveInfo"("athleteId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Recruiter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Athlete" ADD CONSTRAINT "Athlete_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Recruiter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AthleteSensitiveInfo" ADD CONSTRAINT "AthleteSensitiveInfo_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_recruiterId_fkey" FOREIGN KEY ("recruiterId") REFERENCES "Recruiter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NilDeal" ADD CONSTRAINT "NilDeal_athleteId_fkey" FOREIGN KEY ("athleteId") REFERENCES "Athlete"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_nilDealId_fkey" FOREIGN KEY ("nilDealId") REFERENCES "NilDeal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CheckConstraint
ALTER TABLE "User" ADD CONSTRAINT role_link_consistency CHECK (
  (role = 'ADMIN'     AND "athleteId" IS NULL     AND "recruiterId" IS NULL) OR
  (role = 'RECRUITER' AND "recruiterId" IS NOT NULL AND "athleteId" IS NULL) OR
  (role = 'ATHLETE'   AND "athleteId" IS NOT NULL AND "recruiterId" IS NULL)
);
