# Project Rules & Style Guidelines - Tether Trouble

This file documents the workspace coding standards, color palettes, character visual language, logic separation rules, and architectural constraints for **Tether Trouble**.

---

## 🎨 Color Palette & Visual Style Guide

### Core Neon Cyberpunk Palette
- **Primary Pink Glow:** `#EC4899` (Used for tether slingshot accents, primary buttons, and hero cat trim).
- **Secondary Cyan Glow:** `#06B6D4` (Used for interactive borders, progress indicators, and active HUD accents).
- **Hazard Gold/Yellow:** `#FACC15` (Used for high scores, bomb fuses, and max combo heat).
- **Hazard Red:** `#EF4444` / `#F87171` (Used for sawblades, lasers, and fail causes).
- **Dark Slate Background:** `#0F172A` (Background canvas and main container surface).
- **Card Surface Slate:** `#1E293B` (Used for floating overlays, modals, and settings cards).
- **Border Slate:** `#334155` (Subtle card border strokes).

### Character & Asset Visual Language
- **Cat Character (`cat.png`):** High-contrast cyberpunk cat head with glowing cyan eyes, dark stealth armor, and neon pink accents.
- **Bomb Orb (`bomb.png`):** High-contrast black TNT bomb orb with glowing orange fuse spark and yellow emblem.
- **Sawblade (`sawblade.png`):** Circular steel sawblade with sharp glowing cyan/magenta teeth.
- **Particles (`star.png` / `spark.png`):** Neon glowing 5-point star particles for near-miss explosions and tap feedback.

---

## 📜 Architectural Rules & Logic Separation

### 1. Zero-Await Synchronous Hot Paths
- **Game Loop & Tap Handling:** The 60 FPS physics loop, collision checks, tap slingshot events, SFX triggers, and haptics MUST be 100% synchronous with zero `await` delays.
- **Async Storage:** Preload all data into memory using `StorageService.preload()` during the splash preloader. Subsequent reads MUST use `getHighScoreSync()`, `getSettingsSync()`, and `getStatsSync()`. Writes MUST be background `fire-and-forget` promises.

### 2. Localization & i18n Rules
- **AR & EN Only:** The app exclusively supports Arabic (`ar`) and English (`en`).
- **No Hard-Coded UI Text:** All user-facing strings must come from `I18nService.t('path.to.key')` or `I18nService.getRandomQuote()`.
- **RTL & LTR UI Presentation:** UI components use dynamic `flexDirection: isRTL ? 'row-reverse' : 'row'` and `textAlign` formatting.
- **Physics Engine Isolation:** Game physics, pendulum math, rope calculations, and canvas coordinates remain physically identical regardless of UI language or direction.

### 3. Screen State Machine
- **App Flow:** `SPLASH` ➔ `MAIN_MENU` ➔ `PLAYING` ➔ `SETTINGS` / `GAMEOVER`.
- **Deterministic Loading:** The `SplashScreen` must track real progress from `AssetPreloaderService` (`0%` to `100%`) before transitioning to `MAIN_MENU`. Fake timers are strictly prohibited.

---

## 🛠️ Code Conventions & File Organization

```text
src/
├── assets/
│   └── spriteAssets.ts       # Central registry for all 8 PNG sprites
├── i18n/
│   ├── ar.json               # Arabic translation dictionary
│   ├── en.json               # English translation dictionary
│   ├── I18nService.ts        # Language manager & persistence
│   └── index.ts              # i18n barrel export
├── services/
│   ├── AssetPreloaderService.ts  # Preloads images, i18n, storage, and audio
│   ├── AudioHapticsService.ts    # Procedural AudioContext synth & haptics
│   └── StorageService.ts         # In-memory cached async storage service
├── screens/
│   ├── SplashScreen/         # Real progress bar preloader screen
│   ├── MainMenu/             # Minimal arcade main menu screen
│   ├── Game/                 # Playable gameplay canvas view
│   ├── GameOver/             # Meme fail snapshot & rank badge modal
│   └── Settings/             # Audio, haptics & language settings modal
├── components/
│   ├── GameCanvas/           # SVG canvas rendering PNG sprites
│   ├── ScoreHUD/             # Floating score & combo multiplier HUD
│   └── LanguageSwitcher/     # Reusable AR / EN toggle button
└── game/
    └── engine/
        └── PhysicsEngine.ts   # Pendulum vector math & collision checks
```

---

## 🔒 Verification Standards

Before completing any feature or modification, the codebase must satisfy:
1. `npx tsc --noEmit` returns **0 errors**.
2. `npm run build:apk` builds a standalone production APK successfully.
