import sharp from "sharp";

// Isolate the mountain "A" glyph from the trimmed wordmark, then square it
// on a transparent canvas so it works as both a nav icon and a favicon.
await sharp("public/brand/tundra-logo-transparent.png")
  .extract({ left: 978, top: 0, width: 182, height: 225 })
  .trim({ threshold: 10 })
  .toFile("scripts/icon-trimmed.png");

const meta = await sharp("scripts/icon-trimmed.png").metadata();
const size = Math.max(meta.width, meta.height);

await sharp("scripts/icon-trimmed.png")
  .resize({
    width: size,
    height: size,
    fit: "contain",
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .toFile("public/brand/tundra-icon-mark.png");

console.log("icon-mark", size, size);
