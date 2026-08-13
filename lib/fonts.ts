import { Inter } from "next/font/google";

// Working default per client brief; swap for next/font/local pointed at
// files dropped in /public/fonts once the client's real UI typeface arrives.
export const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
