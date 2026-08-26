import { ObstacleGate, PlayerTetherState, VisualParticle } from '../../types/game';

export const GAME_CONSTANTS = {
  CANVAS_WIDTH: 360,
  CANVAS_HEIGHT: 640,
  ROPE_LENGTH: 75, // Shorter, tighter tether line for agile control and narrow gate maneuvering
  ENTITY_RADIUS: 20, // Slightly more forgiving collision radius
  ROTATION_SPEED_BASE: 0.058, // Nimble rotation speed for easy 360-deg loops
  ROTATION_SPEED_MAX: 0.10,
  WORLD_SPEED_BASE: 2.2, // Smoother world travel speed for better reaction time
  WORLD_SPEED_MAX: 6.5,
  GATE_SPACING: 270,
  SAWBLADE_BASE_RADIUS: 15,
  NEAR_MISS_DISTANCE: 16, // Margin for near miss score bonus
};

export const MEME_FAIL_QUOTES = [
  "Physics left the chat",
  "1 millimeter away from viral glory!",
  "Calculated... but man, am I bad at math",
  "The sawblade won this round",
  "Gravity wins again!",
  "My thumb betrayed me",
  "Top 1% unexpected catastrophe",
  "Tether snapped, dignity gone",
  "Don't show this attempt to my friends",
  "A masterclass in failing gracefully"
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
      currentAngle: -Math.PI / 2, // 90 deg pointing UPWARDS towards next gate
      elasticity: 0.85,
    };
  }

  public static togglePivot(tether: PlayerTetherState): PlayerTetherState {
    const newPivot = tether.pivotIndex === 0 ? 1 : 0;
    // Invert rotation direction on every tap (alternating clockwise & counter-clockwise)
    const currentSpeed = Math.abs(tether.angularVelocity);
    const newDir = tether.angularVelocity > 0 ? -1 : 1;
    const newAngularVel = newDir * Math.min(currentSpeed * 1.03, GAME_CONSTANTS.ROTATION_SPEED_MAX);

    return {
      ...tether,
      pivotIndex: newPivot,
      angularVelocity: newAngularVel,
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
    // Comfortably wide gap width for smooth gameplay balance
    const gapWidth = Math.max(195 - difficulty * 3, 150);
    const padding = 55;
    const xCenter =
      customXCenter !== undefined
        ? customXCenter
        : padding + Math.random() * (width - padding * 2 - gapWidth) + gapWidth / 2;

    const types: ObstacleGate['type'][] = ['standard', 'sawblade', 'moving', 'double_saw'];
    let selectedType: ObstacleGate['type'] = 'standard';

    const rand = Math.random();
    if (rand > 0.40) selectedType = 'sawblade';
    else if (rand > 0.20) selectedType = 'moving';
    else if (rand > 0.85) selectedType = 'double_saw';

    return {
      id,
      y: worldY,
      xCenter,
      gapWidth,
      passed: false,
      type: selectedType,
      speedX: selectedType === 'moving' ? (Math.random() > 0.5 ? 1.2 : -1.2) * (1 + difficulty * 0.08) : 0,
      sawbladeRadius: 15,
      sawbladeAngle: 0,
      sawbladeRotationSpeed: 0.12 + Math.random() * 0.06,
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

    // Use precise collision radius matching visual sprite boundaries (13px instead of 20px)
    const colRadius = 13;

    // Gate vertical bounds (match visual barrier height y ± 10)
    const gateTop = gate.y - 10;
    const gateBottom = gate.y + 10;

    let collided = false;
    let nearMiss = false;
    let hitCause = '';

    [bodyA, bodyB].forEach((body) => {
      // Check if body is in horizontal slice of gate
      if (body.y + colRadius > gateTop && body.y - colRadius < gateBottom) {
        if (body.x - colRadius < leftWallEdge || body.x + colRadius > rightWallEdge) {
          collided = true;
          hitCause = 'gate';
        }
      }

      // Sawblade hazard collision: ANY contact with sawblades instantly results in GAME OVER
      const sawR = gate.sawbladeRadius || 15;
      const sawHitDist = colRadius + sawR * 1.15;
      const sawPositions = [leftWallEdge, rightWallEdge];

      sawPositions.forEach((sawX) => {
        const dist = Math.hypot(body.x - sawX, body.y - gate.y);
        if (dist < sawHitDist) {
          collided = true;
          hitCause = 'sawblade';
        }
      });
    });

    // Check screen boundary collision (Side walls and Top ceiling limit)
    if (bodyA.x < -10 || bodyA.x > width + 10 || bodyB.x < -10 || bodyB.x > width + 10) {
      if (!collided) {
        collided = true;
        hitCause = 'wall';
      }
    } else if (bodyA.y < 15 || bodyB.y < 15) {
      if (!collided) {
        collided = true;
        hitCause = 'ceiling';
      }
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

  public static calculateDangerProximity(
    tether: PlayerTetherState,
    gates: ObstacleGate[],
    width: number
  ): number {
    const dangerDistThreshold = 55;
    let maxDanger = 0;

    const bodies = [tether.bodyA, tether.bodyB];

    bodies.forEach((body) => {
      // 1. Distance to screen side walls
      const distLeft = body.x;
      const distRight = width - body.x;

      if (distLeft < dangerDistThreshold) {
        const danger = 1 - Math.max(0, distLeft) / dangerDistThreshold;
        if (danger > maxDanger) maxDanger = danger;
      }
      if (distRight < dangerDistThreshold) {
        const danger = 1 - Math.max(0, distRight) / dangerDistThreshold;
        if (danger > maxDanger) maxDanger = danger;
      }

      // 2. Distance to active obstacle gates & sawblades
      gates.forEach((gate) => {
        const distY = Math.abs(body.y - gate.y);
        if (distY < 60) {
          const leftWallEdge = gate.xCenter - gate.gapWidth / 2;
          const rightWallEdge = gate.xCenter + gate.gapWidth / 2;

          // Sawblades proximity
          const sawR = gate.sawbladeRadius || 15;
          const sawPositions = [leftWallEdge, rightWallEdge];

          sawPositions.forEach((sawX) => {
            const distSaw = Math.hypot(body.x - sawX, body.y - gate.y);
            const dangerDist = sawR + 45;
            if (distSaw < dangerDist) {
              const danger = 1 - Math.max(0, distSaw) / dangerDist;
              if (danger > maxDanger) maxDanger = danger;
            }
          });

          // Gate wall barriers proximity
          if (body.x < leftWallEdge + 25 || body.x > rightWallEdge - 25) {
            const danger = 1 - distY / 60;
            if (danger > maxDanger) maxDanger = danger;
          }
        }
      });
    });

    return Math.min(1, Math.max(0, maxDanger));
  }
}
