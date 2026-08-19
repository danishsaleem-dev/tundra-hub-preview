import { clerkMiddleware } from "@clerk/nextjs/server";

// Deny-by-default: every route requires a signed-in session unless its
// pathname is explicitly excluded below. New routes are protected
// automatically — nothing to opt into per page.
const PUBLIC_PATH_PREFIXES = ["/sign-in", "/sign-up"];

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
