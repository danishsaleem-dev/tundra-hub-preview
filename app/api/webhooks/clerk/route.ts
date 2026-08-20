import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { handleUserCreated } from "@/lib/webhooks/handle-user-created";

export async function POST(request: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(request);
  } catch (err) {
    console.error("Clerk webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (evt.type !== "user.created") {
    return NextResponse.json({ ok: true, ignored: evt.type });
  }

  try {
    const result = await handleUserCreated(evt.data);
    if (result.status === "skipped") {
      console.error(`user.created for ${evt.data.id} skipped: ${result.reason}`);
    }
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("Failed to process user.created webhook", err);
    // Non-2xx so Clerk retries — likely transient (DB hiccup) or a real
    // data problem worth surfacing in logs rather than silently dropping.
    return NextResponse.json({ error: "Failed to process webhook" }, { status: 500 });
  }
}
