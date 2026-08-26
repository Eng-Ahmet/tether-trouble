import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, useWindowDimensions, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { GameCanvas } from './src/components/GameCanvas/GameCanvas';
import { ScoreHUD } from './src/components/ScoreHUD/ScoreHUD';
import { GameOverModal } from './src/screens/GameOver/GameOverModal';
import { SplashScreen } from './src/screens/SplashScreen/SplashScreen';
import { MainMenuScreen } from './src/screens/MainMenu/MainMenuScreen';
import { SettingsModal } from './src/screens/Settings/SettingsModal';
import { TutorialModal } from './src/components/TutorialModal/TutorialModal';
import { ProfileModal } from './src/screens/Profile/ProfileModal';
import { BadgesModal } from './src/screens/Badges/BadgesModal';
import { AboutModal } from './src/screens/About/AboutModal';
import { PrivacyPolicyModal } from './src/screens/Privacy/PrivacyPolicyModal';
import { InteractiveTutorialScreen } from './src/screens/Tutorial/InteractiveTutorialScreen';
import { PhysicsEngine, GAME_CONSTANTS } from './src/game/engine/PhysicsEngine';
import { GameStatus, MemeFailSnapshot, ObstacleGate, PlayerTetherState, VisualParticle } from './src/types/game';
import { audioHaptics } from './src/services/AudioHapticsService';
import { StorageService } from './src/services/StorageService';
import { I18nService } from './src/i18n';

// Hide native splash screen as soon as possible
ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

type AppScreen = 'SPLASH' | 'MAIN_MENU' | 'TUTORIAL' | 'PRACTICE' | 'PROFILE' | 'PLAYING' | 'SETTINGS' | 'ABOUT' | 'PRIVACY' | 'BADGES';

export default function App() {
  const { width, height } = useWindowDimensions();
  const screenWidth = width > 0 ? width : GAME_CONSTANTS.CANVAS_WIDTH;
  const screenHeight = height > 0 ? height : GAME_CONSTANTS.CANVAS_HEIGHT;

  const [appScreen, setAppScreen] = useState<AppScreen>('SPLASH');
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const gameStatusRef = useRef<GameStatus>('IDLE');

  useEffect(() => {
    // Immediately dismiss Expo native splash screen on mount
    ExpoSplashScreen.hideAsync().catch(() => {});
  }, []);

  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [nearMissCount, setNearMissCount] = useState<number>(0);
  const [failSnapshot, setFailSnapshot] = useState<MemeFailSnapshot | null>(null);

  // Refs for 60 FPS hot path physics loop
  const cameraScrollYRef = useRef<number>(0);
  const tetherRef = useRef<PlayerTetherState>(PhysicsEngine.initTetherState(screenWidth, screenHeight));
  const gatesRef = useRef<ObstacleGate[]>([]);
  const particlesRef = useRef<VisualParticle[]>([]);
  const scoreRef = useRef<number>(0);
  const comboRef = useRef<number>(1);
  const nearMissRef = useRef<number>(0);
  const difficultyRef = useRef<number>(1);
  const frameIdRef = useRef<number | null>(null);

  // Screen shake animation
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [shakeOffset, setShakeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const triggerScreenShake = useCallback(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 12, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -12, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 40, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 40, useNativeDriver: true }),
    ]).start();
  }, [shakeAnim]);

  useEffect(() => {
    const id = shakeAnim.addListener(({ value }) => {
      setShakeOffset({
        x: (Math.random() - 0.5) * value,
        y: (Math.random() - 0.5) * value,
      });
    });
    return () => shakeAnim.removeListener(id);
  }, [shakeAnim]);

  // Start new game session
  const startGame = useCallback(() => {
    scoreRef.current = 0;
    comboRef.current = 1;
    nearMissRef.current = 0;
    difficultyRef.current = 1;
    cameraScrollYRef.current = 0;

    tetherRef.current = PhysicsEngine.initTetherState(screenWidth, screenHeight);
    gatesRef.current = [
      PhysicsEngine.generateObstacle('gate_start_1', -150, screenWidth, 1, screenWidth / 2),
      PhysicsEngine.generateObstacle('gate_start_2', -150 - GAME_CONSTANTS.GATE_SPACING, screenWidth, 1),
      PhysicsEngine.generateObstacle('gate_start_3', -150 - GAME_CONSTANTS.GATE_SPACING * 2, screenWidth, 1),
    ];
    particlesRef.current = [];

    setScore(0);
    setCombo(1);
    setNearMissCount(0);
    setFailSnapshot(null);
    gameStatusRef.current = 'PLAYING';
    setGameStatus('PLAYING');

    audioHaptics.playTapSlingSFX();
    audioHaptics.triggerMediumHaptic();
  }, [screenWidth, screenHeight]);

  const [, setRenderTick] = useState<number>(0);

  // Main high-performance 60 FPS Game Loop
  const gameLoop = useCallback(() => {
    if (gameStatusRef.current !== 'PLAYING') return;

    // 1. Scroll vertical world downward as player travels up
    const worldSpeed = GAME_CONSTANTS.WORLD_SPEED_BASE + difficultyRef.current * 0.35;
    cameraScrollYRef.current += worldSpeed;

    // 2. Update tether pendulum physics
    tetherRef.current = PhysicsEngine.updateTether(tetherRef.current, 1 + difficultyRef.current * 0.08);

    // 3. Move gates downward with world scroll
    gatesRef.current = gatesRef.current.map((gate) => {
      const newY = gate.y + worldSpeed;
      let newX = gate.xCenter;
      let newSpeedX = gate.speedX || 0;

      if (gate.type === 'moving') {
        newX += newSpeedX;
        if (newX < gate.gapWidth / 2 + 40 || newX > screenWidth - gate.gapWidth / 2 - 40) {
          newSpeedX = -newSpeedX;
        }
      }

      return {
        ...gate,
        y: newY,
        xCenter: newX,
        speedX: newSpeedX,
        sawbladeAngle: (gate.sawbladeAngle || 0) + (gate.sawbladeRotationSpeed || 0.08),
      };
    });

    // 4. Recycle passed gates and score checks
    const activePlayerY = Math.min(tetherRef.current.bodyA.y, tetherRef.current.bodyB.y);

    gatesRef.current.forEach((gate) => {
      if (!gate.passed && gate.y > activePlayerY) {
        gate.passed = true;
        scoreRef.current += 1 * comboRef.current;
        setScore(scoreRef.current);
        audioHaptics.playGatePassSFX();
        audioHaptics.triggerLightHaptic();

        // Increment difficulty every 5 gates
        if (scoreRef.current % 5 === 0) {
          difficultyRef.current += 1;
        }
      }
    });

    // Remove gates below screen bottom and spawn new top gates strictly above top screen boundary (y <= -150)
    if (gatesRef.current.length > 0 && gatesRef.current[0].y > screenHeight + 100) {
      gatesRef.current.shift();
      const highestY = Math.min(...gatesRef.current.map((g) => g.y));
      const newGateY = Math.min(highestY - GAME_CONSTANTS.GATE_SPACING, -150);
      const newGateId = `gate_${Date.now()}_${Math.random()}`;
      gatesRef.current.push(PhysicsEngine.generateObstacle(newGateId, newGateY, screenWidth, difficultyRef.current));
    }

    // 5. Update visual particles
    particlesRef.current = particlesRef.current
      .map((p) => ({
        ...p,
        x: p.x + p.vx,
        y: p.y + p.vy,
        life: p.life + 1,
      }))
      .filter((p) => p.life < p.maxLife);

    // 6. Force React to re-render GameCanvas with updated refs
    setRenderTick((t) => (t + 1) % 10000);

    // 7. Collision & Near-Miss Detection
    let hitDetected = false;
    let hitCauseText = '';

    for (const gate of gatesRef.current) {
      const { collided, nearMiss, hitCause } = PhysicsEngine.checkCollision(tetherRef.current, gate, screenWidth);

      if (nearMiss) {
        nearMissRef.current += 1;
        comboRef.current = Math.min(comboRef.current + 1, 8);
        setCombo(comboRef.current);
        setNearMissCount(nearMissRef.current);

        // Near-Miss Spark Explosion FX
        const spark = PhysicsEngine.createSparkBurst(tetherRef.current.bodyA.x, tetherRef.current.bodyA.y, '#38BDF8', 8);
        particlesRef.current.push(...spark);
        audioHaptics.playNearMissSFX();
        audioHaptics.triggerLightHaptic();
        triggerScreenShake();
      }

      if (collided) {
        hitDetected = true;
        hitCauseText = hitCause;
        break;
      }
    }

    if (hitDetected) {
      // Trigger Game Over Sequence
      audioHaptics.playFailSFX();
      audioHaptics.triggerNotificationErrorHaptic();
      triggerScreenShake();

      const finalScore = scoreRef.current;
      const isNewHigh = StorageService.saveHighScore(finalScore);
      const currentBest = StorageService.getHighScoreSync();
      if (isNewHigh) setHighScore(currentBest);

      const localizedDeathCause = I18nService.t(`hitCauses.${hitCauseText}`);
      const targetedQuote = I18nService.getCauseQuote(hitCauseText);
      setFailSnapshot({
        quote: targetedQuote,
        score: finalScore,
        highScore: currentBest,
        nearMissCount: nearMissRef.current,
        maxCombo: comboRef.current,
        deathCause: localizedDeathCause,
        snapshotTime: new Date().toLocaleTimeString(),
      });

      gameStatusRef.current = 'GAMEOVER';
      setGameStatus('GAMEOVER');
      return;
    }

    frameIdRef.current = requestAnimationFrame(gameLoop);
  }, [screenWidth, screenHeight, triggerScreenShake]);

  useEffect(() => {
    if (gameStatus === 'PLAYING') {
      gameStatusRef.current = 'PLAYING';
      audioHaptics.startBGM();
      frameIdRef.current = requestAnimationFrame(gameLoop);
    } else if (gameStatus === 'GAMEOVER') {
      audioHaptics.stopBGM();
    }
    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [gameStatus, gameLoop]);

  // Screen Tap Handler: Slingshot & Pivot Swap!
  const handleTap = () => {
    audioHaptics.unlockAudio();
    if (gameStatus === 'PLAYING') {
      tetherRef.current = PhysicsEngine.togglePivot(tetherRef.current);
      audioHaptics.playTapSlingSFX();
      audioHaptics.triggerLightHaptic();

      // Tap burst particles
      const activePivot = tetherRef.current.pivotIndex === 0 ? tetherRef.current.bodyA : tetherRef.current.bodyB;
      const burst = PhysicsEngine.createSparkBurst(activePivot.x, activePivot.y, '#EC4899', 6);
      particlesRef.current.push(...burst);
    }
  };

  // 1. SPLASH SCREEN PRELOADER
  if (appScreen === 'SPLASH') {
    return <SplashScreen onFinish={() => { setHighScore(StorageService.getHighScoreSync()); setAppScreen('MAIN_MENU'); }} />;
  }

  // 2. MAIN MENU SCREEN
  if (appScreen === 'MAIN_MENU') {
    return (
      <MainMenuScreen
        onStartGame={() => {
          setAppScreen('TUTORIAL');
        }}
        onOpenSettings={() => setAppScreen('SETTINGS')}
        onOpenProfile={() => setAppScreen('PROFILE')}
        onOpenTutorial={() => setAppScreen('PRACTICE')}
        onOpenAbout={() => setAppScreen('ABOUT')}
        onOpenPrivacy={() => setAppScreen('PRIVACY')}
        onOpenBadges={() => setAppScreen('BADGES')}
      />
    );
  }

  // 3. TUTORIAL COACHMARK SCREEN
  if (appScreen === 'TUTORIAL') {
    return (
      <TutorialModal
        onStart={() => {
          startGame();
          setAppScreen('PLAYING');
        }}
      />
    );
  }

  // 4. INTERACTIVE PRACTICE SIMULATOR SCREEN
  if (appScreen === 'PRACTICE') {
    return (
      <InteractiveTutorialScreen
        onBack={() => setAppScreen('MAIN_MENU')}
        onStartGame={() => {
          startGame();
          setAppScreen('PLAYING');
        }}
      />
    );
  }

  // 5. PROFILE MODAL SCREEN
  if (appScreen === 'PROFILE') {
    return <ProfileModal onClose={() => setAppScreen('MAIN_MENU')} onOpenBadges={() => setAppScreen('BADGES')} />;
  }

  // 6. SETTINGS MODAL SCREEN
  if (appScreen === 'SETTINGS') {
    return <SettingsModal onClose={() => setAppScreen('MAIN_MENU')} />;
  }

  // 7. ABOUT US SCREEN
  if (appScreen === 'ABOUT') {
    return <AboutModal onClose={() => setAppScreen('MAIN_MENU')} />;
  }

  // 8. PRIVACY POLICY SCREEN
  if (appScreen === 'PRIVACY') {
    return <PrivacyPolicyModal onClose={() => setAppScreen('MAIN_MENU')} />;
  }

  // 9. DEDICATED 500 MYSTERY BADGES SCREEN
  if (appScreen === 'BADGES') {
    return <BadgesModal onClose={() => setAppScreen('MAIN_MENU')} />;
  }

  // 4. GAMEPLAY SCREEN & GAME OVER OVERLAY
  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPressIn={handleTap} disabled={gameStatus === 'GAMEOVER'}>
        <View style={styles.container}>
          <StatusBar style="light" hidden />

          {/* 60 FPS SVG Canvas with PNG Sprites */}
          <GameCanvas
            width={screenWidth}
            height={screenHeight}
            tether={tetherRef.current}
            gates={gatesRef.current}
            particles={particlesRef.current}
            screenShakeOffset={shakeOffset}
          />

          {/* Floating Minimal HUD */}
          {gameStatus === 'PLAYING' && (
            <ScoreHUD
              score={score}
              highScore={highScore}
              combo={combo}
              nearMissCount={nearMissCount}
            />
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Game Over Meme Share Screen with Home button */}
      {gameStatus === 'GAMEOVER' && failSnapshot && (
        <GameOverModal
          snapshot={failSnapshot}
          onRestart={startGame}
          onGoHome={() => {
            gameStatusRef.current = 'IDLE';
            setGameStatus('IDLE');
            setAppScreen('MAIN_MENU');
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});

