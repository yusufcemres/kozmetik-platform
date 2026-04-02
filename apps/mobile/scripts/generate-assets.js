/**
 * Asset placeholder generator
 *
 * Bu script gerçek icon/splash image'lar yerine placeholder oluşturur.
 * Gerçek asset'lar tasarımcı tarafından hazırlanacak.
 *
 * Kullanım:
 *   node scripts/generate-assets.js
 *
 * Gereksinimler:
 *   npm install sharp (veya manuel olarak assets/ klasörüne koyun)
 *
 * Gerekli dosyalar:
 *   assets/icon.png          — 1024x1024 (App Store + Android)
 *   assets/adaptive-icon.png — 1024x1024 (Android adaptive icon foreground)
 *   assets/splash.png        — 1284x2778 (Splash screen)
 *   assets/favicon.png       — 48x48 (Web)
 */

console.log(`
Kozmetik Platform — Asset Gereksinimleri
========================================

1. icon.png (1024x1024)
   - App icon for both iOS and Android
   - No transparency for iOS
   - Teal (#0D9488) background with white logo

2. adaptive-icon.png (1024x1024)
   - Android adaptive icon foreground
   - Transparent background OK
   - Logo centered in safe area (inner 66%)

3. splash.png (1284x2778)
   - Splash screen image
   - Background: #0D9488
   - Centered logo, white

4. favicon.png (48x48)
   - Web favicon
   - Same as icon, scaled down

Place these files in apps/mobile/assets/
`);
