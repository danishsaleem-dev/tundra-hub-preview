"use client";

import Image from "next/image";
import { AlertTriangle, Clock } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/Button";

export interface NoAccountFoundProps {
  email?: string | null;
  /** True when this Clerk account carries invite metadata but the
   * corresponding Postgres User row hasn't been created yet — the webhook
   * that creates it hasn't landed. A timing gap, not a real error. */
  pending?: boolean;
}

export function NoAccountFound({ email, pending }: NoAccountFoundProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-page-bg px-4 py-10">
      <Image
        src="/brand/tundra-logo-transparent.png"
        alt="Tundra Sports Group"
        width={1160}
        height={297}
        className="h-9 w-auto"
        priority
      />
      <div className="w-full max-w-md rounded-xl border border-card-tint bg-white p-6 text-center shadow-sm">
        {pending ? (
          <>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue/10 text-brand-blue">
              <Clock className="h-5 w-5" />
            </span>
            <h1 className="mt-4 text-lg font-bold text-surface-navy">
              Setting up your account
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-neutral-text">
              Your invitation was accepted — we&apos;re finishing setting up
              your account now. This usually takes a few seconds. Try again
              shortly.
            </p>
          </>
        ) : (
          <>
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-critical-bg text-critical-text">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <h1 className="mt-4 text-lg font-bold text-surface-navy">
              No account found
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-neutral-text">
              {email ? (
                <>
                  There&apos;s no Tundra Sports Hub account linked to{" "}
                  <span className="font-medium text-surface-navy">{email}</span>.
                </>
              ) : (
                "There's no Tundra Sports Hub account linked to this sign-in."
              )}{" "}
              Access is invite-only — ask an admin to set up your account,
              then try again.
            </p>
          </>
        )}
        <SignOutButton>
          <Button variant="outline" className="mt-5">
            Sign out
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}
