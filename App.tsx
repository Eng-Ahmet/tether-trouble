import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableWithoutFeedback, useWindowDimensions, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GameCanvas } from './src/components/GameCanvas/GameCanvas';
import { ScoreHUD } from './src/components/ScoreHUD/ScoreHUD';
import { GameOverModal } from './src/screens/GameOver/GameOverModal';
import { SplashScreen } from './src/screens/SplashScreen/SplashScreen';
import { MainMenuScreen } from './src/screens/MainMenu/MainMenuScreen';
import { SettingsModal } from './src/screens/Settings/SettingsModal';
import { PhysicsEngine, GAME_CONSTANTS } from './src/game/engine/PhysicsEngine';
import { GameStatus, MemeFailSnapshot, ObstacleGate, PlayerTetherState, VisualParticle } from './src/types/game';
import { audioHaptics } from './src/services/AudioHapticsService';
import { StorageService } from './src/services/StorageService';
import { I18nService } from './src/i18n';

type AppScreen = 'SPLASH' | 'MAIN_MENU' | 'PLAYING' | 'SETTINGS';

export default function App() {
  const { width, height } = useWindowDimensions();
  const screenWidth = width > 0 ? width : GAME_CONSTANTS.CANVAS_WIDTH;
  const screenHeight = height > 0 ? height : GAME_CONSTANTS.CANVAS_HEIGHT;

  const [appScreen, setAppScreen] = useState<AppScreen>('SPLASH');
  const [gameStatus, setGameStatus] = useState<GameStatus>('IDLE');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(1);
  const [nearMissCount, setNearMissCount] = useState<number>(0);
  const [failSnapshot, setFailSnapshot] = useState<MemeFailSnapshot | null>(null);

  // Game Loop References (Zero React render per frame overhead)
  const tetherRef = useRef<PlayerTetherState>(PhysicsEngine.initTetherState(screenWidth, screenHeight));
  const gatesRef = useRef<ObstacleGate[]>([]);
  const particlesRef = useRef<VisualParticle[]>([]);
  const frameIdRef = useRef<number | null>(null);
  const scoreRef = useRef<number>(0);
  const comboRef = useRef<number>(1);
  const nearMissRef = useRef<number>(0);
  const difficultyRef = useRef<number>(1);
  const cameraScrollYRef = useRef<number>(0);

  // Screen Shake animation
  const shakeAnimX = useRef(new Animated.Value(0)).current;
  const shakeAnimY = useRef(new Animated.Value(0)).current;
  const [shakeOffset, setShakeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const triggerScreenShake = useCallback(() => {
    shakeAnimX.setValue(Math.random() * 12 - 6);
    shakeAnimY.setValue(Math.random() * 12 - 6);
    Animated.parallel([
      Animated.spring(shakeAnimX, { toValue: 0, friction: 4, useNativeDriver: true }),
      Animated.spring(shakeAnimY, { toValue: 0, friction: 4, useNativeDriver: true }),
    ]).start();
  }, [shakeAnimX, shakeAnimY]);

  useEffect(() => {
    const listenerX = shakeAnimX.addListener((v) => setShakeOffset((prev) => ({ ...prev, x: v.value })));
    const listenerY = shakeAnimY.addListener((v) => setShakeOffset((prev) => ({ ...prev, y: v.value })));
    return () => {
      shakeAnimX.removeListener(listenerX);
      shakeAnimY.removeListener(listenerY);
    };
  }, [shakeAnimX, shakeAnimY]);

  // Initial game setup
  const startGame = useCallback(() => {
    tetherRef.current = PhysicsEngine.initTetherState(screenWidth, screenHeight);
    
    // Player initial Y position
    const playerY = screenHeight * 0.72;

    // Spawn initial wave of obstacle gates starting safely above the player
    const initialGates: ObstacleGate[] = [];
    for (let i = 1; i <= 4; i++) {
      const gateY = playerY - i * GAME_CONSTANTS.GATE_SPACING;
      // First 2 gates are centered on screenWidth / 2 for a smooth start
      const customX = i <= 2 ? screenWidth / 2 : undefined;
      initialGates.push(PhysicsEngine.generateObstacle(`gate_${i}`, gateY, screenWidth, 1, customX));
    }

    gatesRef.current = initialGates;
    particlesRef.current = [];
    scoreRef.current = 0;
    comboRef.current = 1;
    nearMissRef.current = 0;
    difficultyRef.current = 1;
    cameraScrollYRef.current = 0;

    setScore(0);
    setCombo(1);
    setNearMissCount(0);
    setFailSnapshot(null);
    setGameStatus('PLAYING');

    audioHaptics.playTapSlingSFX();
    audioHaptics.triggerMediumHaptic();
  }, [screenWidth, screenHeight]);

  // Main high-performance 60 FPS Game Loop
  const gameLoop = useCallback(() => {
    if (gameStatus !== 'PLAYING') return;

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

    // Remove gates below screen bottom and spawn new top gates
    if (gatesRef.current.length > 0 && gatesRef.current[0].y > screenHeight + 100) {
      gatesRef.current.shift();
      const topGateY = gatesRef.current[gatesRef.current.length - 1].y - GAME_CONSTANTS.GATE_SPACING;
      const newGateId = `gate_${Date.now()}_${Math.random()}`;
      gatesRef.current.push(PhysicsEngine.generateObstacle(newGateId, topGateY, screenWidth, difficultyRef.current));
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

    // 6. Collision & Near-Miss Detection
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

      StorageService.updateStats(nearMissRef.current, comboRef.current);

      const randomQuote = I18nService.getRandomQuote();
      setFailSnapshot({
        quote: randomQuote,
        score: finalScore,
        highScore: currentBest,
        nearMissCount: nearMissRef.current,
        maxCombo: comboRef.current,
        deathCause: hitCauseText,
        snapshotTime: new Date().toLocaleTimeString(),
      });

      setGameStatus('GAMEOVER');
      return;
    }

    frameIdRef.current = requestAnimationFrame(gameLoop);
  }, [gameStatus, screenWidth, screenHeight, triggerScreenShake]);

  useEffect(() => {
    if (gameStatus === 'PLAYING') {
      frameIdRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
  }, [gameStatus, gameLoop]);

  // Screen Tap Handler: Slingshot & Pivot Swap!
  const handleTap = () => {
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
          startGame();
          setAppScreen('PLAYING');
        }}
        onOpenSettings={() => setAppScreen('SETTINGS')}
      />
    );
  }

  // 3. SETTINGS MODAL SCREEN
  if (appScreen === 'SETTINGS') {
    return <SettingsModal onClose={() => setAppScreen('MAIN_MENU')} />;
  }

  // 4. GAMEPLAY SCREEN & GAME OVER OVERLAY
  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={handleTap} disabled={gameStatus === 'GAMEOVER'}>
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
            <ScoreHUD score={score} highScore={highScore} combo={combo} nearMissCount={nearMissCount} />
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Game Over Meme Share Screen */}
      {gameStatus === 'GAMEOVER' && failSnapshot && (
        <GameOverModal snapshot={failSnapshot} onRestart={startGame} />
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

