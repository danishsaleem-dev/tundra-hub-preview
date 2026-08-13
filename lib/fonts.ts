import localFont from "next/font/local";

// Client's brand typeface — Archivo variable font (wght 100-900), from
// public/brand/Fonts/Archivo Font Package/, copied into app/fonts for a
// clean import path (the original folder has spaces/commas in filenames).
export const fontSans = localFont({
  src: [
    {
      path: "../app/fonts/Archivo-Variable.ttf",
      weight: "100 900",
      style: "normal",
    },
    {
      path: "../app/fonts/Archivo-Variable-Italic.ttf",
      weight: "100 900",
      style: "italic",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});
