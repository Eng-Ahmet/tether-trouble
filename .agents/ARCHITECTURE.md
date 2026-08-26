# System Architecture & Technical Blueprint - Tether Trouble

This document outlines the complete architectural design, data flow, physics engine mathematics, rendering engine, and service subsystem for **Tether Trouble**.

---

## 1. High-Level System Architecture

```text
                               ┌───────────────────────────┐
                               │       App Startup         │
                               └─────────────┬─────────────┘
                                             │
                                             ▼
                               ┌───────────────────────────┐
                               │   SplashScreen Preloader  │
                               │  (AssetPreloaderService)  │
                               └─────────────┬─────────────┘
                                             │ 100% Ready
                                             ▼
                               ┌───────────────────────────┐
                               │     MainMenuScreen        │
                               └─────────────┬─────────────┘
                                             │ Tap Play
                                             ▼
                               ┌───────────────────────────┐
                               │     60 FPS Game Loop      │
                               │  (App.tsx + PhysicsEngine)│
                               └──────┬──────────────┬─────┘
                                      │              │
                                Collided          Settings
                                      │              │
                                      ▼              ▼
                               ┌──────────────┐ ┌──────────────┐
                               │ GameOverModal│ │SettingsModal │
                               └──────────────┘ └──────────────┘
```

---

## 2. Layered Subsystems

### A. Game Physics Engine (`src/game/engine/PhysicsEngine.ts`)
The physics engine operates on pure 2D vector kinematics and pendulum physics:
- **Tether State:** Consists of two bodies (`bodyA` - Cat, `bodyB` - Bomb) connected by a constant rope length \(L = 110\text{px}\).
- **Pivot Swapping:** At any frame, one body acts as the fixed anchor pivot (\((x_p, y_p)\)) while the other swings along an orbital arc:
  \[
  x_{\text{swing}} = x_p + L \cdot \cos(\theta)
  \]
  \[
  y_{\text{swing}} = y_p + L \cdot \sin(\theta)
  \]
- **Catapult Momentum:** Tapping anywhere on the screen swaps the pivot index (`pivotIndex === 0 ? 1 : 0`). The swinging entity instantly becomes the fixed anchor, transferring rotational velocity and slingshotting momentum forward!
- **Collision & Near-Miss Detection:** Checks circular distance and horizontal wall boundaries:
  - **Collision:** Triggers if distance \(d < r_1 + r_2\).
  - **Near-Miss:** Triggers if \(r_1 + r_2 \le d < r_1 + r_2 + 14\text{px}\), increasing combo multiplier (up to 8x) and triggering spark explosions.

---

### B. Rendering Subsystem (`src/components/GameCanvas/GameCanvas.tsx`)
- **SVG Engine:** Powered by `react-native-svg`.
- **PNG Sprite Rendering:** Replaces basic vector shapes with SVG `<Image href={SpriteAssets.cat} ... />`, `<Image href={SpriteAssets.bomb} ... />`, `<Image href={SpriteAssets.sawblade} ... />`, and `<Image href={SpriteAssets.star} ... />`.
- **Dynamic Rope:** Dynamic SVG `<Line>` drawn between `bodyA` and `bodyB` with neon gradient stroke.
- **Zero-Latency State Synchronization:** Game loop state is held in `useRef` and updated via `requestAnimationFrame` for 60 FPS performance without React render lag.

---

### C. Services & Localization Subsystem
1. **`AssetPreloaderService` (`src/services/AssetPreloaderService.ts`):**
   Sequential preloader for PNG assets (`expo-asset`), `StorageService`, `AudioHapticsService`, and `I18nService`. Exposes progress callback `(progress: number, status: string) => void`.
2. **`StorageService` (`src/services/StorageService.ts`):**
   Provides synchronous zero-await accessors (`getHighScoreSync()`, `getStatsSync()`) powered by in-memory caching. Saves are performed asynchronously in the background.
3. **`I18nService` (`src/i18n/I18nService.ts`):**
   Handles Arabic (`ar`) and English (`en`) dictionaries with full RTL (`flexDirection: row-reverse`) support, subscriber notification, and fallback handling.
4. **`AudioHapticsService` (`src/services/AudioHapticsService.ts`):**
   Zero-latency procedural `AudioContext` synthesizer generating tap slings, gate passes, near-miss chimes, and crash bonks alongside native `expo-haptics`.

---

## 3. Data Flow Diagram

```text
[User Input (Tap)] ──> App.tsx (handleTap) ──> PhysicsEngine.togglePivot()
                                                  │
                                                  ├──> AudioHapticsService (playTapSFX)
                                                  └──> GameCanvas (Update SVG Sprites)
```

---

## 4. Build & Distribution Pipeline
- **Script:** `npm run build:apk`
- **Output:** Builds a native Android project via `npx expo prebuild`, compiles using Gradle & OpenJDK 21, and exports the standalone APK directly to `./TetherTrouble.apk`.
