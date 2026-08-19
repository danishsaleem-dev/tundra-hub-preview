import type { Metadata } from "next";
import Image from "next/image";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign In — Tundra Sports Hub",
};

export default function SignInPage() {
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
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#0877E3",
            colorPrimaryForeground: "#FFFFFF",
            colorForeground: "#06133A",
            colorMutedForeground: "#595959",
            colorBackground: "#FFFFFF",
            colorInput: "#FFFFFF",
            colorInputForeground: "#06133A",
            colorBorder: "#ECEEFB",
            colorDanger: "#CF1322",
            colorSuccess: "#389E0D",
            colorWarning: "#D46B08",
            borderRadius: "0.5rem",
            fontFamily: "var(--font-sans)",
          },
          elements: {
            card: "shadow-sm border border-card-tint rounded-xl",
            headerTitle: "text-surface-navy",
            headerSubtitle: "text-neutral-text",
            footerActionLink: "text-brand-blue hover:text-brand-blue/90",
          },
        }}
      />
    </div>
  );
}
