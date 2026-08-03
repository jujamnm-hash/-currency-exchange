const fs = require("fs");
const path = require("path");

async function main() {
  const sharp = require("sharp");
  const root = path.join(__dirname, "..");
  const svgPath = path.join(root, "public", "icon.svg");
  const svg = fs.readFileSync(svgPath);

  const outs = [
    { file: "public/icon-192.png", size: 192 },
    { file: "public/icon-512.png", size: 512 },
    { file: "public/apple-touch-icon.png", size: 180 },
    { file: "icons/icon-1024.png", size: 1024 },
    { file: "icons/icon-20@2x.png", size: 40 },
    { file: "icons/icon-20@3x.png", size: 60 },
    { file: "icons/icon-29@2x.png", size: 58 },
    { file: "icons/icon-29@3x.png", size: 87 },
    { file: "icons/icon-40@2x.png", size: 80 },
    { file: "icons/icon-40@3x.png", size: 120 },
    { file: "icons/icon-60@2x.png", size: 120 },
    { file: "icons/icon-60@3x.png", size: 180 },
    { file: "icons/icon-76@2x.png", size: 152 },
    { file: "icons/icon-83.5@2x.png", size: 167 },
  ];

  fs.mkdirSync(path.join(root, "icons"), { recursive: true });

  for (const out of outs) {
    const dest = path.join(root, out.file);
    await sharp(svg).resize(out.size, out.size).png().toFile(dest);
    console.log("wrote", out.file);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
