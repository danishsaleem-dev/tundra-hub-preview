-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('NOT_INVITED', 'PENDING', 'ACTIVE');

-- AlterTable
ALTER TABLE "Athlete" ADD COLUMN     "clerkInvitationId" TEXT,
ADD COLUMN     "inviteStatus" "InviteStatus" NOT NULL DEFAULT 'NOT_INVITED',
ADD COLUMN     "invitedAt" TIMESTAMP(3),
ADD COLUMN     "invitedBy" TEXT;

-- AlterTable
ALTER TABLE "Recruiter" ADD COLUMN     "clerkInvitationId" TEXT,
ADD COLUMN     "inviteStatus" "InviteStatus" NOT NULL DEFAULT 'NOT_INVITED',
ADD COLUMN     "invitedAt" TIMESTAMP(3),
ADD COLUMN     "invitedBy" TEXT;
