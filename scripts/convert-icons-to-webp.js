#!/usr/bin/env node
/**
 * Convert quick-copy source images in public/icons/ to .webp.
 * Run: node scripts/convert-icons-to-webp.js
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const decodeIco = require("decode-ico");

const ICONS_DIR = path.join(__dirname, "..", "public", "icons");
const SIZE = 48;

/** [source filename in public/icons, output .webp basename] */
const CONVERSIONS = [
  ["gmail.ico", "email.webp"],
  ["iphone-x.png", "phone.webp"],
  ["location.png", "location.webp"],
  ["address.png", "address.webp"],
  ["last_role.png", "role.webp"],
  ["linkedin.ico", "linkedin.webp"],
  ["gdrive.png", "drive.webp"],
];

function largestIcoBitmap(filePath) {
  const images = decodeIco(fs.readFileSync(filePath));
  if (!images.length) throw new Error("empty ICO");
  const valid = images.filter((img) => {
    const need = img.width * img.height * 4;
    return img.data && img.data.length >= need;
  });
  if (!valid.length) throw new Error("no valid ICO bitmap");
  return valid.reduce((best, img) =>
    img.width * img.height > best.width * best.height ? img : best
  );
}

async function toWebpFromPath(srcPath) {
  return sharp(srcPath)
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 85, effort: 4 })
    .toBuffer();
}

async function toWebpFromIco(srcPath) {
  const { width, height, data } = largestIcoBitmap(srcPath);
  return sharp(Buffer.from(data), {
    raw: { width, height, channels: 4 },
  })
    .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 85, effort: 4 })
    .toBuffer();
}

async function convertOne(sourceName, outName) {
  const src = path.join(ICONS_DIR, sourceName);
  const dest = path.join(ICONS_DIR, outName);
  if (!fs.existsSync(src)) {
    console.warn(`skip (missing): ${sourceName}`);
    return false;
  }
  const before = fs.statSync(src).size;
  const ext = path.extname(sourceName).toLowerCase();
  const webp =
    ext === ".ico"
      ? await toWebpFromIco(src)
      : await toWebpFromPath(src);
  await fs.promises.writeFile(dest, webp);
  const after = fs.statSync(dest).size;
  fs.unlinkSync(src);
  console.log(`${sourceName} → ${outName} (${before} → ${after} bytes)`);
  return true;
}

async function main() {
  let n = 0;
  for (const [src, out] of CONVERSIONS) {
    try {
      if (await convertOne(src, out)) n += 1;
    } catch (err) {
      console.error(`failed ${src}:`, err.message);
      process.exitCode = 1;
    }
  }
  console.log(`Done: ${n} icon(s) converted.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
