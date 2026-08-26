import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Line, Path, Rect, G, Defs, LinearGradient, Stop, Image as SvgImage } from 'react-native-svg';
import { ObstacleGate, PlayerTetherState, VisualParticle } from '../../types/game';
import { SpriteAssets } from '../../assets/spriteAssets';

interface GameCanvasProps {
  width: number;
  height: number;
  tether: PlayerTetherState;
  gates: ObstacleGate[];
  particles: VisualParticle[];
  screenShakeOffset: { x: number; y: number };
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  width,
  height,
  tether,
  gates,
  particles,
  screenShakeOffset,
}) => {
  const { bodyA, bodyB } = tether;

  return (
    <View style={[styles.container, { transform: [{ translateX: screenShakeOffset.x }, { translateY: screenShakeOffset.y }] }]}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Neon Spline Glow Gradient */}
          <LinearGradient id="ropeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#EC4899" stopOpacity="1" />
            <Stop offset="50%" stopColor="#3B82F6" stopOpacity="1" />
            <Stop offset="100%" stopColor="#06B6D4" stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* 1. OBSTACLES & GATES */}
        {gates.map((gate) => {
          const leftWallW = gate.xCenter - gate.gapWidth / 2;
          const rightWallX = gate.xCenter + gate.gapWidth / 2;
          const rightWallW = width - rightWallX;
          const sawRadius = gate.sawbladeRadius || 28;

          return (
            <G key={gate.id}>
              {/* Left Wall Barrier */}
              <Rect
                x={0}
                y={gate.y - 10}
                width={leftWallW}
                height={20}
                fill="#334155"
                rx={6}
                stroke="#06B6D4"
                strokeWidth={2}
              />
              <Circle x={leftWallW} y={gate.y} r={10} fill="#06B6D4" opacity={0.8} />

              {/* Right Wall Barrier */}
              <Rect
                x={rightWallX}
                y={gate.y - 10}
                width={rightWallW}
                height={20}
                fill="#334155"
                rx={6}
                stroke="#06B6D4"
                strokeWidth={2}
              />
              <Circle x={rightWallX} y={gate.y} r={10} fill="#06B6D4" opacity={0.8} />

              {/* Score Target Ring Glow Gate */}
              <Line
                x1={leftWallW + 5}
                y1={gate.y}
                x2={rightWallX - 5}
                y2={gate.y}
                stroke={gate.passed ? '#22C55E' : '#38BDF8'}
                strokeWidth={gate.passed ? 3 : 1.5}
                strokeDasharray="6,4"
                opacity={0.7}
              />

              {/* SAWBLADE HAZARD PNG SPRITE */}
              {(gate.type === 'sawblade' || gate.type === 'double_saw') && (
                <G transform={`translate(${gate.xCenter}, ${gate.y}) rotate(${(gate.sawbladeAngle || 0) * (180 / Math.PI)})`}>
                  <SvgImage
                    href={SpriteAssets.sawblade}
                    x={-sawRadius}
                    y={-sawRadius}
                    width={sawRadius * 2}
                    height={sawRadius * 2}
                    preserveAspectRatio="xMidYMid slice"
                  />
                </G>
              )}
            </G>
          );
        })}

        {/* 2. ELASTIC ROPE DYNAMIC SPLINE */}
        <Line
          x1={bodyA.x}
          y1={bodyA.y}
          x2={bodyB.x}
          y2={bodyB.y}
          stroke="url(#ropeGrad)"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {/* Rope Tension Glow Inner Line */}
        <Line
          x1={bodyA.x}
          y1={bodyA.y}
          x2={bodyB.x}
          y2={bodyB.y}
          stroke="#FFFFFF"
          strokeWidth={2}
          opacity={0.8}
        />

        {/* 3. PARTICLES & SPARKS PNG SPRITES */}
        {particles.map((p) => {
          const pSize = Math.max(p.size * (1 - p.life / p.maxLife) * 2, 4);
          return (
            <G key={p.id} transform={`translate(${p.x - pSize / 2}, ${p.y - pSize / 2})`}>
              <SvgImage
                href={SpriteAssets.star}
                x={0}
                y={0}
                width={pSize}
                height={pSize}
                opacity={p.alpha * (1 - p.life / p.maxLife)}
              />
            </G>
          );
        })}

        {/* 4. PLAYER ENTITY A (CAT HEAD PNG SPRITE) */}
        <G transform={`translate(${bodyA.x}, ${bodyA.y}) rotate(${(bodyA.angle * 180) / Math.PI})`}>
          {/* Active Pivot Glow Ring Sprite */}
          {tether.pivotIndex === 0 && (
            <SvgImage
              href={SpriteAssets.ropeAnchor}
              x={-bodyA.radius - 8}
              y={-bodyA.radius - 8}
              width={(bodyA.radius + 8) * 2}
              height={(bodyA.radius + 8) * 2}
            />
          )}
          <SvgImage
            href={SpriteAssets.cat}
            x={-bodyA.radius}
            y={-bodyA.radius}
            width={bodyA.radius * 2}
            height={bodyA.radius * 2}
          />
        </G>

        {/* 5. PLAYER ENTITY B (BOMB / ORB PNG SPRITE) */}
        <G transform={`translate(${bodyB.x}, ${bodyB.y}) rotate(${(bodyB.angle * 180) / Math.PI})`}>
          {/* Active Pivot Glow Ring Sprite */}
          {tether.pivotIndex === 1 && (
            <SvgImage
              href={SpriteAssets.ropeAnchor}
              x={-bodyB.radius - 8}
              y={-bodyB.radius - 8}
              width={(bodyB.radius + 8) * 2}
              height={(bodyB.radius + 8) * 2}
            />
          )}
          <SvgImage
            href={SpriteAssets.bomb}
            x={-bodyB.radius}
            y={-bodyB.radius}
            width={bodyB.radius * 2}
            height={bodyB.radius * 2}
          />
        </G>

        {/* 6. SWING LAUNCH DIRECTION ARROW INDICATOR */}
        {(() => {
          const swingingBody = tether.pivotIndex === 0 ? bodyB : bodyA;
          const launchAngle = tether.currentAngle + (tether.angularVelocity >= 0 ? Math.PI / 2 : -Math.PI / 2);
          const arrowX = swingingBody.x + Math.cos(launchAngle) * 36;
          const arrowY = swingingBody.y + Math.sin(launchAngle) * 36;
          const isPointingUp = Math.sin(launchAngle) < -0.4;

          return (
            <G key="launch_indicator">
              {/* Slingshot Trajectory Line */}
              <Line
                x1={swingingBody.x}
                y1={swingingBody.y}
                x2={arrowX}
                y2={arrowY}
                stroke={isPointingUp ? '#FACC15' : '#06B6D4'}
                strokeWidth={3}
                strokeDasharray="4,3"
                opacity={0.9}
              />
              <Circle
                cx={arrowX}
                cy={arrowY}
                r={6}
                fill={isPointingUp ? '#FACC15' : '#06B6D4'}
              />
            </G>
          );
        })()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
});
