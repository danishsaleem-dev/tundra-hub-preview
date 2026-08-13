import sharp from "sharp";
import { mkdirSync } from "node:fs";

const SRC = "public/brand/Logo Files";
const OUT = "public/brand";
mkdirSync(OUT, { recursive: true });

const variants = [
  { in: "tundra_logo_transparent.png", out: "tundra-logo-transparent.png" },
  { in: "tundra_logo_white.png", out: "tundra-logo-white.png" },
  { in: "tundra_logo_black.png", out: "tundra-logo-black.png" },
  { in: "tundra_logo_grey.png", out: "tundra-logo-grey.png" },
];

for (const v of variants) {
  await sharp(`${SRC}/${v.in}`).trim({ threshold: 10 }).toFile(`${OUT}/${v.out}`);
  const meta = await sharp(`${OUT}/${v.out}`).metadata();
  console.log(v.out, meta.width, meta.height);
}
