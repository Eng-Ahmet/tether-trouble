export type EntityType = 'cat' | 'bomb' | 'sawblade' | 'gate' | 'particle' | 'laser';

export interface Vector2D {
  x: number;
  y: number;
}

export interface PhysicsBody {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  angle: number;
}

export interface PlayerTetherState {
  bodyA: PhysicsBody; // Cat
  bodyB: PhysicsBody; // Bomb / Orb
  pivotIndex: 0 | 1; // 0 = bodyA anchored, 1 = bodyB anchored
  ropeLength: number;
  angularVelocity: number;
  currentAngle: number;
  elasticity: number;
}

export interface ObstacleGate {
  id: string;
  y: number; // Vertical position in world space
  xCenter: number;
  gapWidth: number;
  passed: boolean;
  type: 'standard' | 'moving' | 'sawblade' | 'double_saw';
  speedX?: number;
  sawbladeRadius?: number;
  sawbladeAngle?: number;
  sawbladeRotationSpeed?: number;
}

export interface VisualParticle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  maxLife: number;
  life: number;
}

export type GameStatus = 'IDLE' | 'PLAYING' | 'GAMEOVER';

export interface MemeFailSnapshot {
  quote: string;
  score: number;
  highScore: number;
  nearMissCount: number;
  maxCombo: number;
  deathCause: string;
  snapshotTime: string;
}

export interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;
}
