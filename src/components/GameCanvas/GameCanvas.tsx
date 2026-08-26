import React from 'react';
import { View, StyleSheet, Image as RNImage } from 'react-native';
import Svg, { Circle, Line, Path, Rect, G, Defs, LinearGradient, Stop, Image as SvgImage } from 'react-native-svg';
import { ObstacleGate, PlayerTetherState, VisualParticle } from '../../types/game';
import { SpriteAssets } from '../../assets/spriteAssets';
import { PhysicsEngine } from '../../game/engine/PhysicsEngine';

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

  const sawbladeAsset = RNImage.resolveAssetSource(SpriteAssets.sawblade);
  const catAsset = RNImage.resolveAssetSource(SpriteAssets.cat);
  const bombAsset = RNImage.resolveAssetSource(SpriteAssets.bomb);
  const starAsset = RNImage.resolveAssetSource(SpriteAssets.star);

  // Synchronous hot path calculation for hazard proximity in RED (#EF4444)
  const dangerProximity = PhysicsEngine.calculateDangerProximity(tether, gates, width);
  const warningAlpha = Math.max(dangerProximity, 0);

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
          {/* Danger Warning Glow Gradient */}
          <LinearGradient id="dangerGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#EF4444" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#EF4444" stopOpacity="0" />
          </LinearGradient>
        </Defs>

        {/* 1. SIDE HAZARD BORDER STRIPES (Visually Demarcated Side Bounds) */}
        <Line x1={4} y1={0} x2={4} y2={height} stroke="#EF4444" strokeWidth={3} strokeDasharray="8,6" opacity={0.65} />
        <Line x1={width - 4} y1={0} x2={width - 4} y2={height} stroke="#EF4444" strokeWidth={3} strokeDasharray="8,6" opacity={0.65} />

        {/* 2. DANGER PROXIMITY CORNER WARNING GRAPHICS */}
        {warningAlpha > 0 && (
          <G opacity={warningAlpha}>
            {/* Top-Left Corner Warning */}
            <Path d="M 0 0 L 40 0 L 0 40 Z" fill="#EF4444" opacity={0.4} />
            <Path d="M 4 4 L 35 4 L 4 35" stroke="#FACC15" strokeWidth={3} fill="none" />

            {/* Top-Right Corner Warning */}
            <Path d={`M ${width} 0 L ${width - 40} 0 L ${width} 40 Z`} fill="#EF4444" opacity={0.4} />
            <Path d={`M ${width - 4} 4 L ${width - 35} 4 L ${width - 4} 35`} stroke="#FACC15" strokeWidth={3} fill="none" />

            {/* Bottom-Left Corner Warning */}
            <Path d={`M 0 ${height} L 40 ${height} L 0 ${height - 40} Z`} fill="#EF4444" opacity={0.4} />
            <Path d={`M 4 ${height - 4} L 35 ${height - 4} L 4 ${height - 35}`} stroke="#FACC15" strokeWidth={3} fill="none" />

            {/* Bottom-Right Corner Warning */}
            <Path d={`M ${width} ${height} L ${width - 40} ${height} L ${width} ${height - 40} Z`} fill="#EF4444" opacity={0.4} />
            <Path d={`M ${width - 4} ${height - 4} L ${width - 35} ${height - 4} L ${width - 4} ${height - 35}`} stroke="#FACC15" strokeWidth={3} fill="none" />
          </G>
        )}

        {/* 3. OBSTACLES & GATES */}
        {gates.map((gate) => {
          const leftWallW = gate.xCenter - gate.gapWidth / 2;
          const rightWallX = gate.xCenter + gate.gapWidth / 2;
          const rightWallW = width - rightWallX;
          const sawRadius = 15;

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

              {/* TWO SMALL SPINNING SAWBLADE HAZARD SPRITES ATTACHED TO BOTH WALL TIPS */}
              {(gate.type === 'sawblade' || gate.type === 'double_saw' || gate.type === 'moving') && (
                <>
                  {/* Left Barrier Wall Tip Sawblade */}
                  <G transform={`translate(${leftWallW}, ${gate.y}) rotate(${(gate.sawbladeAngle || 0) * (180 / Math.PI)})`}>
                    <SvgImage
                      href={sawbladeAsset}
                      x={-sawRadius}
                      y={-sawRadius}
                      width={sawRadius * 2}
                      height={sawRadius * 2}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </G>
                  {/* Right Barrier Wall Tip Sawblade */}
                  <G transform={`translate(${rightWallX}, ${gate.y}) rotate(${-(gate.sawbladeAngle || 0) * (180 / Math.PI)})`}>
                    <SvgImage
                      href={sawbladeAsset}
                      x={-sawRadius}
                      y={-sawRadius}
                      width={sawRadius * 2}
                      height={sawRadius * 2}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </G>
                </>
              )}
            </G>
          );
        })}

        {/* 4. ELASTIC ROPE DYNAMIC SPLINE */}
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

        {/* 6. PARTICLES & SPARKS PNG SPRITES */}
        {particles.map((p) => {
          const pSize = Math.max(p.size * (1 - p.life / p.maxLife) * 2, 4);
          return (
            <G key={p.id} transform={`translate(${p.x - pSize / 2}, ${p.y - pSize / 2})`}>
              <SvgImage
                href={starAsset}
                x={0}
                y={0}
                width={pSize}
                height={pSize}
                opacity={p.alpha * (1 - p.life / p.maxLife)}
              />
            </G>
          );
        })}

        {/* 7. DANGER RED HAZARD PROXIMITY AURA RINGS */}
        {dangerProximity > 0.02 && (
          <G opacity={dangerProximity}>
            <Circle
              cx={bodyA.x}
              cy={bodyA.y}
              r={bodyA.radius + 6 + dangerProximity * 12}
              fill="rgba(239, 68, 68, 0.25)"
              stroke="#EF4444"
              strokeWidth={3}
            />
            <Circle
              cx={bodyB.x}
              cy={bodyB.y}
              r={bodyB.radius + 6 + dangerProximity * 12}
              fill="rgba(239, 68, 68, 0.25)"
              stroke="#EF4444"
              strokeWidth={3}
            />
          </G>
        )}

        {/* 8. PLAYER ENTITY A (CAT HEAD PNG SPRITE) */}
        <G transform={`translate(${bodyA.x}, ${bodyA.y}) rotate(${(bodyA.angle * 180) / Math.PI})`}>
          <SvgImage
            href={catAsset}
            x={-bodyA.radius}
            y={-bodyA.radius}
            width={bodyA.radius * 2}
            height={bodyA.radius * 2}
          />
        </G>

        {/* 9. PLAYER ENTITY B (BOMB / ORB PNG SPRITE) */}
        <G transform={`translate(${bodyB.x}, ${bodyB.y}) rotate(${(bodyB.angle * 180) / Math.PI})`}>
          <SvgImage
            href={bombAsset}
            x={-bodyB.radius}
            y={-bodyB.radius}
            width={bodyB.radius * 2}
            height={bodyB.radius * 2}
          />
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
  },
});
