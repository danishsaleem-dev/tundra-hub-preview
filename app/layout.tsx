import type { Metadata } from "next";
import { fontSans } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tundra Sports Hub",
  description: "Tundra Sports Hub — internal operations platform preview",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
