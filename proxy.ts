import { clerkMiddleware } from "@clerk/nextjs/server";

// Deny-by-default: every route requires a signed-in session unless its
// pathname is explicitly excluded below. New routes are protected
// automatically — nothing to opt into per page.
//
// /api/webhooks is public for a different reason than sign-in/sign-up: its
// caller (Clerk) has no Clerk session at all — it authenticates via a svix
// signature verified inside the route itself (see api/webhooks/clerk).
const PUBLIC_PATH_PREFIXES = ["/sign-in", "/sign-up", "/api/webhooks"];

export default clerkMiddleware(async (auth, req) => {
  const isPublic = PUBLIC_PATH_PREFIXES.some((prefix) =>
    req.nextUrl.pathname.startsWith(prefix),
  );

  if (!isPublic) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
