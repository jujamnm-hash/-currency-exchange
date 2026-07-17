/**
 * Generates PWA and iOS app icons from SVG source.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ICONS_DIR = path.join(ROOT, 'icons');

const SVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#764ba2"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="220" fill="url(#bg)"/>
  <text x="512" y="580" font-size="420" text-anchor="middle" dominant-baseline="middle">💱</text>
</svg>`;

const SIZES = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'icons/icon-20@2x.png', size: 40 },
  { name: 'icons/icon-20@3x.png', size: 60 },
  { name: 'icons/icon-29@2x.png', size: 58 },
  { name: 'icons/icon-29@3x.png', size: 87 },
  { name: 'icons/icon-40@2x.png', size: 80 },
  { name: 'icons/icon-40@3x.png', size: 120 },
  { name: 'icons/icon-60@2x.png', size: 120 },
  { name: 'icons/icon-60@3x.png', size: 180 },
  { name: 'icons/icon-76@2x.png', size: 152 },
  { name: 'icons/icon-83.5@2x.png', size: 167 },
  { name: 'icons/icon-1024.png', size: 1024 }
];

async function main() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.warn('sharp not installed; skipping icon generation');
    return;
  }

  fs.mkdirSync(ICONS_DIR, { recursive: true });
  const svgBuffer = Buffer.from(SVG);

  for (const { name, size } of SIZES) {
    const outputPath = path.join(ROOT, name);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    console.log(`Created ${name} (${size}x${size})`);
  }

  const iosIconPath = path.join(
    ROOT,
    'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png'
  );
  if (fs.existsSync(path.dirname(iosIconPath))) {
    await sharp(svgBuffer).resize(1024, 1024).png().toFile(iosIconPath);
    console.log('Updated iOS AppIcon');
  }
}

main().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
