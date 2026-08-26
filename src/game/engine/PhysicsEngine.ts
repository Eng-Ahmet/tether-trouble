import { ObstacleGate, PlayerTetherState, VisualParticle } from '../../types/game';

export const GAME_CONSTANTS = {
  CANVAS_WIDTH: 360,
  CANVAS_HEIGHT: 640,
  ROPE_LENGTH: 110,
  ENTITY_RADIUS: 22,
  ROTATION_SPEED_BASE: 0.065, // radians per frame
  ROTATION_SPEED_MAX: 0.12,
  WORLD_SPEED_BASE: 2.8,
  WORLD_SPEED_MAX: 7.5,
  GATE_SPACING: 260,
  SAWBLADE_BASE_RADIUS: 28,
  NEAR_MISS_DISTANCE: 14, // Margin for near miss score bonus
};

export const MEME_FAIL_QUOTES = [
  "Physics left the chat 💀",
  "1 millimeter away from viral glory! 😂",
  "Calculated... but man, am I bad at math 🧮",
  "The sawblade won this round 🪚",
  "Cat go BOOM 🐱💥",
  "My thumb betrayed me 👆",
  "Top 1% unexpected catastrophe 😭",
  "Tether snapped, dignity gone 🚀",
  "Don't show this attempt to my friends 🙈",
  "A masterclass in failing gracefully ✨"
];

export class PhysicsEngine {
  public static initTetherState(width: number, height: number): PlayerTetherState {
    const centerX = width / 2;
    const centerY = height * 0.72; // Start in lower area of screen
    const ropeLen = GAME_CONSTANTS.ROPE_LENGTH;

    return {
      bodyA: {
        id: 'cat',
        x: centerX,
        y: centerY - ropeLen / 2,
        vx: 0,
        vy: 0,
        radius: GAME_CONSTANTS.ENTITY_RADIUS,
        mass: 1,
        angle: 0,
      },
      bodyB: {
        id: 'bomb',
        x: centerX,
        y: centerY + ropeLen / 2,
        vx: 0,
        vy: 0,
        radius: GAME_CONSTANTS.ENTITY_RADIUS,
        mass: 1,
        angle: 0,
      },
      pivotIndex: 0, // Cat is initial pivot
      ropeLength: ropeLen,
      angularVelocity: GAME_CONSTANTS.ROTATION_SPEED_BASE,
      currentAngle: Math.PI / 2, // 90 deg vertical
      elasticity: 0.85,
    };
  }

  public static togglePivot(tether: PlayerTetherState): PlayerTetherState {
    const newPivot = tether.pivotIndex === 0 ? 1 : 0;
    // Boost rotation speed slightly on tether swap for satisfying slingshot feel!
    const newAngularVel = tether.angularVelocity * (tether.angularVelocity > 0 ? 1.05 : -1.05);

    return {
      ...tether,
      pivotIndex: newPivot,
      angularVelocity: Math.min(Math.max(newAngularVel, -GAME_CONSTANTS.ROTATION_SPEED_MAX), GAME_CONSTANTS.ROTATION_SPEED_MAX),
    };
  }

  public static updateTether(tether: PlayerTetherState, speedMultiplier: number): PlayerTetherState {
    const currentSpeed = GAME_CONSTANTS.ROTATION_SPEED_BASE * speedMultiplier;
    // Direction of angular vel preserved, magnitude scaled
    const dir = tether.angularVelocity >= 0 ? 1 : -1;
    const updatedAngularVel = dir * currentSpeed;
    const nextAngle = tether.currentAngle + updatedAngularVel;

    const pivot = tether.pivotIndex === 0 ? tether.bodyA : tether.bodyB;
    const swinging = tether.pivotIndex === 0 ? tether.bodyB : tether.bodyA;

    // Recalculate swinging body's relative position on perimeter
    const swingX = pivot.x + Math.cos(nextAngle) * tether.ropeLength;
    const swingY = pivot.y + Math.sin(nextAngle) * tether.ropeLength;

    const updatedPivot = { ...pivot, angle: pivot.angle + 0.02 };
    const updatedSwinging = {
      ...swinging,
      x: swingX,
      y: swingY,
      angle: swinging.angle + updatedAngularVel * 2,
    };

    return {
      ...tether,
      angularVelocity: updatedAngularVel,
      currentAngle: nextAngle,
      bodyA: tether.pivotIndex === 0 ? updatedPivot : updatedSwinging,
      bodyB: tether.pivotIndex === 0 ? updatedSwinging : updatedPivot,
    };
  }

  public static generateObstacle(
    id: string,
    worldY: number,
    width: number,
    difficulty: number,
    customXCenter?: number
  ): ObstacleGate {
    const minGap = Math.max(135 - difficulty * 3, 95);
    const gapWidth = minGap;
    const padding = 60;
    const xCenter =
      customXCenter !== undefined
        ? customXCenter
        : padding + Math.random() * (width - padding * 2 - gapWidth) + gapWidth / 2;

    const types: ObstacleGate['type'][] = ['standard', 'sawblade', 'moving', 'double_saw'];
    let selectedType: ObstacleGate['type'] = 'standard';

    if (difficulty > 2) {
      const rand = Math.random();
      if (rand > 0.65) selectedType = 'sawblade';
      else if (rand > 0.4) selectedType = 'moving';
      else if (rand > 0.85) selectedType = 'double_saw';
    }

    return {
      id,
      y: worldY,
      xCenter,
      gapWidth,
      passed: false,
      type: selectedType,
      speedX: selectedType === 'moving' ? (Math.random() > 0.5 ? 1.5 : -1.5) * (1 + difficulty * 0.1) : 0,
      sawbladeRadius: GAME_CONSTANTS.SAWBLADE_BASE_RADIUS,
      sawbladeAngle: 0,
      sawbladeRotationSpeed: 0.08 + Math.random() * 0.05,
    };
  }

  public static checkCollision(
    tether: PlayerTetherState,
    gate: ObstacleGate,
    width: number
  ): { collided: boolean; nearMiss: boolean; hitCause: string } {
    const bodyA = tether.bodyA;
    const bodyB = tether.bodyB;

    // Check collision against left and right wall hazards of the gate
    const leftWallEdge = gate.xCenter - gate.gapWidth / 2;
    const rightWallEdge = gate.xCenter + gate.gapWidth / 2;

    // Gate vertical bounds tolerance
    const gateTop = gate.y - 18;
    const gateBottom = gate.y + 18;

    let collided = false;
    let nearMiss = false;
    let hitCause = '';

    [bodyA, bodyB].forEach((body) => {
      // Check if body is in horizontal slice of gate
      if (body.y + body.radius > gateTop && body.y - body.radius < gateBottom) {
        if (body.x - body.radius < leftWallEdge || body.x + body.radius > rightWallEdge) {
          collided = true;
          hitCause = 'Crashed into Neon Barrier';
        }
      }

      // Sawblade specific circular distance collision & near miss
      if (gate.type === 'sawblade' || gate.type === 'double_saw') {
        const sawX = gate.xCenter;
        const sawY = gate.y;
        const dist = Math.hypot(body.x - sawX, body.y - sawY);
        const hitDist = body.radius + (gate.sawbladeRadius || GAME_CONSTANTS.SAWBLADE_BASE_RADIUS);

        if (dist < hitDist) {
          collided = true;
          hitCause = 'Shredded by Sawblade! 🪚';
        } else if (dist < hitDist + GAME_CONSTANTS.NEAR_MISS_DISTANCE) {
          nearMiss = true;
        }
      }
    });

    // Also check screen boundary collision
    if (
      bodyA.x - bodyA.radius < 0 ||
      bodyA.x + bodyA.radius > width ||
      bodyB.x - bodyB.radius < 0 ||
      bodyB.x + bodyB.radius > width
    ) {
      collided = true;
      hitCause = 'Slammed into Boundary Wall';
    }

    return { collided, nearMiss, hitCause };
  }

  public static createSparkBurst(x: number, y: number, color: string, count: number = 12): VisualParticle[] {
    const particles: VisualParticle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      particles.push({
        id: Math.random().toString(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 4,
        alpha: 1,
        maxLife: 20 + Math.random() * 15,
        life: 0,
      });
    }
    return particles;
  }
}
