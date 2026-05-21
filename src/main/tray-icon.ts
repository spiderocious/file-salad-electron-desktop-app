import path from 'node:path';

import { nativeImage, type NativeImage } from 'electron';

// The tray glyph is a template image (alpha-only) so macOS tints it for light /
// dark menu bars automatically. The PNGs live in src/main/assets and are copied
// to out/main/assets at build time (see electron.vite.config.ts). Swap them for
// the final FileSalad mark before shipping.
export function createTrayIcon(): NativeImage {
  const iconPath = path.join(__dirname, 'assets/tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  icon.setTemplateImage(true);
  return icon;
}
