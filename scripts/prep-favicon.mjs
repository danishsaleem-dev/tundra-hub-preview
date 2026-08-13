import sharp from "sharp";

// Favicon needs a solid backdrop — the transparent icon mark alone
// disappears against light browser chrome at 16–32px.
const SIZE = 256;
const backdrop = Buffer.from(
  `<svg width="${SIZE}" height="${SIZE}"><rect width="${SIZE}" height="${SIZE}" rx="56" fill="#06133A"/></svg>`,
);

const mark = await sharp("public/brand/tundra-icon-mark.png")
  .resize({ width: Math.round(SIZE * 0.72), height: Math.round(SIZE * 0.72), fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .toBuffer();

await sharp(backdrop)
  .composite([{ input: mark, gravity: "center" }])
  .png()
  .toFile("app/icon.png");

console.log("app/icon.png written");
