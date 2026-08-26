# 🐱💥 Tether Trouble: Chop & Drop

> **A high-octane, hyper-addictive 1-tap mobile physics arcade game built with React Native & Expo (SDK 57).**
> *1-Tap Pendulum Mechanics. Cyberpunk PNG Sprites. 60 FPS Dynamic Engine. AR/EN i18n with RTL.*

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Expo](https://img.shields.io/badge/Expo-SDK_57-000000.svg)](https://docs.expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.86.2-61DAFB.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0.3-3178C6.svg)](https://www.typescriptlang.org/)

---

## 🌟 Overview & Mechanics

**Tether Trouble** is built around a single, highly satisfying physics mechanic: **a mischievous Cyberpunk Cat head and an explosive TNT Bomb orb tethered together by a dynamic elastic rope.**

They spin around each other in continuous pendulum motion. **Tapping anywhere on screen instantly shifts the anchor pivot point and catapults the free entity around the other.**

Navigate upwards through neon score gates, rotating sawblades, and moving hazards. Slip past hazards with fraction-of-a-millimeter near misses to ignite **Combo Multipliers** (up to 8x) and screen-shaking spark bursts!

---

## ⚡ Key Features

- 🐱 **High-Resolution PNG Sprite Inventory (`assets/sprites/`):** Custom 3D transparent PNG game graphics for Cat, Bomb, Sawblades, Stars, Gates, Lasers, Sparks, and Rope Anchors.
- ⏳ **Deterministic Asset Preloader (`SplashScreen`):** Real-time loading progress bar (`0%` to `100%`) pre-warming PNG image sprites, storage, and audio before entering gameplay.
- 🌐 **Arabic & English i18n System (`src/i18n/`):** Full bilingual support with dynamic **RTL (Right-to-Left)** layout formatting for Arabic and **LTR** for English.
- 🎮 **1-Tap Controls:** Simple 100ms gesture response. Tap anywhere to toggle pivot and catapult forward.
- ⚡ **60 FPS Performance:** Dynamic SVG physics engine operating synchronously outside heavy React re-renders.
- 🔊 **Zero-Latency Procedural Audio Synthesizer:** Pure Web Audio / Expo AudioContext synthesizer producing snappy pops, spring slings, near-miss chimes, and crash bonks.
- 📳 **Tactile Haptic Feedback:** Integrated `expo-haptics` providing physical feedback for taps, combos, and collisions.
- 📸 **Viral Meme Fail Cards:** Dynamic freeze-frame fail snapshot screens generating hilarious quotes in Arabic and English (*"الفيزياء غادرت المحادثة 💀"*, *"Physics left the chat 💀"*) and 1-tap social share card.
- 🏆 **High Score & Stats Persistence:** In-memory cached storage for instant `0ms` reads and non-blocking background saves via `@react-native-async-storage/async-storage`.

---

## 🏗️ Tech Stack & Dependency Matrix

| Package | Version | Purpose |
| :--- | :--- | :--- |
| **`expo`** | `~57.0.16` | Mobile Application Framework |
| **`react`** | `19.2.3` | UI Component Framework |
| **`react-native`** | `0.86.2` | Native Mobile Runtime |
| **`typescript`** | `~6.0.3` | Type Safety |
| **`expo-asset`** | `^57.0.14` | PNG Image Preloading |
| **`expo-haptics`** | `~57.0.1` | Native Haptic Feedback |
| **`expo-av`** | `^16.0.8` | Audio Utilities |
| **`react-native-svg`** | `--` | 60 FPS SVG Canvas Renderer |
| **`@react-native-async-storage/async-storage`** | `2.2.0` | Local High Score & Stats Storage |
| **`lucide-react-native`** | `^1.34.0` | UI Icons |

---

## 📁 Repository Directory Structure

```text
tether-trouble/
├── .agents/
│   ├── AGENTS.md                  # Project rules, color palettes, and coding standards
│   └── ARCHITECTURE.md            # System blueprint, pendulum math, and data flow
├── assets/
│   ├── icon.png                   # Main 1024x1024 app icon
│   ├── splash-icon.png            # Splash screen graphic
│   ├── android-icon-*.png         # Android adaptive icons
│   └── sprites/                   # Transparent PNG Game Sprites
│       ├── cat.png                # Cyberpunk Cat character (256x256)
│       ├── bomb.png               # Explosive TNT bomb orb (256x256)
│       ├── sawblade.png           # Neon sawblade hazard (256x256)
│       ├── star.png               # Spark star particle (128x128)
│       ├── gate.png               # Neon barrier gate (256x128)
│       ├── laser.png              # Laser hazard beam (256x64)
│       ├── spark.png              # Collision spark particle (128x128)
│       └── rope_anchor.png        # Rope pivot ring anchor (128x128)
├── src/
│   ├── assets/
│   │   └── spriteAssets.ts        # Centralized PNG sprite registry
│   ├── i18n/
│   │   ├── ar.json                # Arabic translation dictionary
│   │   ├── en.json                # English translation dictionary
│   │   ├── I18nService.ts         # Localization manager & persistence
│   │   └── index.ts               # i18n barrel export
│   ├── services/
│   │   ├── AssetPreloaderService.ts  # Preloads images, storage, audio, & i18n
│   │   ├── AudioHapticsService.ts    # Procedural AudioContext synth & haptics
│   │   └── StorageService.ts         # In-memory cached async storage service
│   ├── screens/
│   │   ├── SplashScreen/          # Preloader screen with real progress bar
│   │   ├── MainMenu/              # Minimal arcade main menu screen
│   │   ├── Game/                  # Playable gameplay canvas view
│   │   ├── GameOver/              # Localized fail snapshot & rank badge modal
│   │   └── Settings/              # Language, sound & stats modal
│   ├── components/
│   │   ├── GameCanvas/            # SVG canvas rendering PNG sprites
│   │   ├── ScoreHUD/              # Floating score & combo multiplier HUD
│   │   └── LanguageSwitcher/      # Reusable AR / EN toggle button
│   └── game/
│       └── engine/
│           └── PhysicsEngine.ts   # Pendulum vector math & collision engine
├── App.tsx                        # Top-level screen state machine
├── package.json                   # Project dependencies and build scripts
└── LICENSE                        # GNU AGPL-3.0 License
```

---

## 🚀 Running & Building the App

### 1. Prerequisites
- Node.js (v18+)
- Expo CLI (`npx expo`)
- OpenJDK 21 & Android SDK (for building APK)

### 2. Development Mode
```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on Android Emulator
npm run android
```

### 3. Build Standalone Android APK
To compile and generate a standalone `.apk` directly in the project root (`./TetherTrouble.apk`):
```bash
npm run build:apk
```

---

## 📜 Open Source License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

> Anyone modifying or distributing this codebase, or using it to host network/cloud services, **must disclose the complete source code under the same AGPL-3.0 license terms.** See the [LICENSE](LICENSE) file for full legal details.
