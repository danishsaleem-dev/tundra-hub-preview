import { PrismaClient } from "@prisma/client";

// Hard-coded, deliberately not read from any env var or config file — the
// point of this guard is that it must hold no matter what DATABASE_URL
// happens to be set to in whatever shell runs this script. This is the
// production Neon project's host; it does not change without a deliberate,
// reviewed migration of the whole app to a different Neon project, which
// would touch this file anyway.
const PRODUCTION_HOST_FRAGMENT = "ep-plain-sea-avl36k05";

function assertNotProduction() {
  const url = process.env.DATABASE_URL ?? "";
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Point it at the development Neon branch before seeding.",
    );
  }
  if (url.includes(PRODUCTION_HOST_FRAGMENT)) {
    throw new Error(
      `Refusing to seed: DATABASE_URL points at the production Neon host (${PRODUCTION_HOST_FRAGMENT}). ` +
        "This script only ever runs against the development branch — point DATABASE_URL at that " +
        "branch's connection string and try again.",
    );
  }
}

assertNotProduction();

const prisma = new PrismaClient();

// Minimal, proven-useful fixture set — the same shape that's been manually
// recreated by hand for RBAC verification since M2: one recruiter, one
// athlete assigned to them (in-scope), one athlete assigned to no one
// (out-of-scope, for proving scoping actually excludes something).
//
// Deliberately no `email` here. A plausible-looking placeholder
// (`name@example.com`) is worse than none: the invite flow would happily
// send to it and report PENDING, with no way to tell it wasn't real until
// someone waits on mail that's never coming. Leaving it unset makes the
// app's own "no email on file" error do that job instead — set a real
// address on the record before inviting it.
async function main() {
  const recruiter = await prisma.recruiter.create({
    data: { name: "Test Recruiter — Sam Ortiz" },
  });

  const assignedAthlete = await prisma.athlete.create({
    data: { athleteName: "Test Athlete — Riley Chen", recruiterId: recruiter.id },
  });

  const unassignedAthlete = await prisma.athlete.create({
    data: { athleteName: "Test Athlete — Jordan Price" },
  });

  console.log("Seeded:");
  console.log(`  Recruiter: ${recruiter.name} (${recruiter.id})`);
  console.log(`  Athlete (assigned to recruiter): ${assignedAthlete.athleteName} (${assignedAthlete.id})`);
  console.log(`  Athlete (unassigned): ${unassignedAthlete.athleteName} (${unassignedAthlete.id})`);
  console.log(
    "\nTo test as these roles: set a real email on the record you want to invite (`email` is " +
      "deliberately left unset by this script), then use the admin invite flow to create a dev-Clerk " +
      "account, accept it, and it'll pair itself with that record automatically via the user.created webhook.",
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
