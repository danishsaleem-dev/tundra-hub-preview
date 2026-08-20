import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/prisma";
import { InviteTestPanel } from "./InviteTestPanel";

// Not a real product page — the bare-minimum trigger surface for exercising
// the STEP 3 invite API routes against real seeded records. Athlete/
// Recruiter detail pages are M5 scope; this is scaffolding for testing only
// and should be deleted once M5 detail pages exist and can host invite
// actions for real.
export default async function DevInviteTestPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [athletes, recruiters] = await Promise.all([
    prisma.athlete.findMany({
      select: { id: true, athleteName: true, email: true, inviteStatus: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.recruiter.findMany({
      select: { id: true, name: true, email: true, inviteStatus: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return <InviteTestPanel athletes={athletes} recruiters={recruiters} />;
}
