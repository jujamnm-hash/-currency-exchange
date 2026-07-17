/**
 * Copies web assets into www/ for Capacitor iOS builds.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const WWW = path.join(ROOT, 'www');

const FILES = [
  'index.html',
  'style.css',
  'ultimate-styles.css',
  'advanced-pro-styles.css',
  'enterprise-styles.css',
  'iraqi-exchange-styles.css',
  'admin-rates-styles.css',
  'navigation.css',
  'mobile-responsive.css',
  'ios-styles.css',
  'app.js',
  'shared-utilities.js',
  'advanced-features.js',
  'premium-features.js',
  'ultimate-features.js',
  'advanced-pro-features.js',
  'enterprise-features.js',
  'iraqi-exchange-rates.js',
  'navigation.js',
  'ios-bridge.js',
  'ios-install.js',
  'manifest.json',
  'sw.js',
  'icon-192.png',
  'icon-512.png',
  'apple-touch-icon.png'
];

function copyFile(name) {
  const src = path.join(ROOT, name);
  const dest = path.join(WWW, name);
  if (!fs.existsSync(src)) {
    console.warn(`Skipping missing file: ${name}`);
    return;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
  console.log(`Copied ${name}`);
}

function copyIconsDir() {
  const srcDir = path.join(ROOT, 'icons');
  const destDir = path.join(WWW, 'icons');
  if (!fs.existsSync(srcDir)) {
    return;
  }
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
    console.log(`Copied icons/${file}`);
  }
}

function main() {
  if (fs.existsSync(WWW)) {
    fs.rmSync(WWW, { recursive: true, force: true });
  }
  fs.mkdirSync(WWW, { recursive: true });

  for (const file of FILES) {
    copyFile(file);
  }
  copyIconsDir();

  console.log('www/ folder ready for Capacitor sync.');
}

main();
