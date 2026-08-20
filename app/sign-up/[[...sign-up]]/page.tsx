"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useSignUp, useUser } from "@clerk/nextjs";
import { AlertTriangle } from "lucide-react";
import { TextField } from "@/components/TextField";
import { Button } from "@/components/Button";

// Deliberately NOT open self-serve sign-up — this only completes an
// already-issued Clerk invitation ticket (see lib/invites.ts's
// redirectUrl, which is what sends invitation emails here instead of
// Clerk's hosted accounts.dev portal). Without a valid __clerk_ticket in
// the URL, this page shows an error state and never renders a form, so
// there is no path to account creation without an invitation — on top of
// the Clerk instance itself being configured invite-only.
export default function SignUpPage() {
  const { isSignedIn } = useUser();
  const { signUp, fetchStatus } = useSignUp();
  const router = useRouter();
  const searchParams = useSearchParams();
  const ticket = searchParams.get("__clerk_ticket");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isSignedIn || signUp.status === "complete") {
      router.push("/dashboard");
    }
  }, [isSignedIn, signUp.status, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ticket) return;
    setSubmitError(null);

    const { error } = await signUp.ticket({ firstName, lastName, ticket });
    if (error) {
      setSubmitError(error.message ?? "Something went wrong completing your invitation.");
      return;
    }

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ decorateUrl }) => {
          const url = decorateUrl("/dashboard");
          if (url.startsWith("http")) {
            window.location.href = url;
          } else {
            router.push(url);
          }
        },
      });
    } else {
      setSubmitError("Sign-up could not be completed. Your invitation may have expired.");
    }
  }

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

      {!ticket ? (
        <div className="w-full max-w-md rounded-xl border border-card-tint bg-white p-6 text-center shadow-sm">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-critical-bg text-critical-text">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <h1 className="mt-4 text-lg font-bold text-surface-navy">
            Invitation required
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-neutral-text">
            This page only completes account setup for an existing Tundra
            Sports Hub invitation. If you were expecting an invite, check
            your email for the link, or ask an admin to send one.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md space-y-4 rounded-xl border border-card-tint bg-white p-6 shadow-sm"
        >
          <div className="text-center">
            <h1 className="text-lg font-bold text-surface-navy">
              Finish setting up your account
            </h1>
            <p className="mt-1 text-sm text-neutral-text">
              You&apos;ve been invited to Tundra Sports Hub.
            </p>
          </div>

          <TextField
            label="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            autoComplete="given-name"
            required
          />
          <TextField
            label="Last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            autoComplete="family-name"
            required
          />

          {submitError && (
            <p className="text-sm text-critical-text">{submitError}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            loading={fetchStatus === "fetching"}
          >
            Continue
          </Button>

          <div id="clerk-captcha" />
        </form>
      )}
    </div>
  );
}
