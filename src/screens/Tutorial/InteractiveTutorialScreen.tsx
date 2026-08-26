import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, ImageBackground } from 'react-native';
import { ArrowLeft, ArrowRight, Play, RefreshCw, Sparkles, CheckCircle2, Gamepad2, Zap, ArrowUp } from 'lucide-react-native';
import Svg, { Line, Image as SvgImage, Circle, G } from 'react-native-svg';
import { SpriteAssets } from '../../assets/spriteAssets';
import { I18nService } from '../../i18n';
import { audioHaptics } from '../../services/AudioHapticsService';

interface InteractiveTutorialScreenProps {
  onBack: () => void;
  onStartGame: () => void;
}

export const InteractiveTutorialScreen: React.FC<InteractiveTutorialScreenProps> = ({ onBack, onStartGame }) => {
  const isRTL = I18nService.isRTL();
  const [pivotIndex, setPivotIndex] = useState<number>(0);
  const [angle, setAngle] = useState<number>(0);
  const [spinSpeed, setSpinSpeed] = useState<number>(0.035);
  const [practiceScore, setPracticeScore] = useState<number>(0);

  // Slowed Down Simulation Rotation Loop (Gentle & Readable Speed)
  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => (prev + spinSpeed) % (Math.PI * 2));
    }, 16);
    return () => clearInterval(interval);
  }, [spinSpeed]);

  const handlePracticeTap = () => {
    setPivotIndex((prev) => (prev === 0 ? 1 : 0));
    setSpinSpeed((prev) => -prev); // Flip rotation direction (Clockwise <-> Counter-Clockwise)
    setPracticeScore((prev) => prev + 1);
    audioHaptics.playTapSlingSFX();
    audioHaptics.triggerLightHaptic();
  };

  const ropeLength = 60;
  const simCenterX = 150;
  const simCenterY = 130;

  const catX = pivotIndex === 0 ? simCenterX : simCenterX + Math.cos(angle) * ropeLength;
  const catY = pivotIndex === 0 ? simCenterY : simCenterY + Math.sin(angle) * ropeLength;

  const bombX = pivotIndex === 1 ? simCenterX : simCenterX + Math.cos(angle) * ropeLength;
  const bombY = pivotIndex === 1 ? simCenterY : simCenterY + Math.sin(angle) * ropeLength;

  const launchAngle = angle + Math.PI / 2;
  const isPointingUp = Math.sin(launchAngle) < -0.4;

  return (
    <ImageBackground source={SpriteAssets.menuBg} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onBack}>
          {isRTL ? <ArrowRight size={20} color="#06B6D4" /> : <ArrowLeft size={20} color="#06B6D4" />}
        </TouchableOpacity>
        <View style={[styles.titleGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Gamepad2 size={22} color="#FACC15" />
          <Text style={styles.headerTitle}>
            {I18nService.t('tutorial.simulatorTitle')}
          </Text>
        </View>
      </View>

      {/* Live Animated Physics Simulation Canvas */}
      <View style={styles.simCard}>
        <View style={[styles.simHeaderGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Zap size={18} color="#06B6D4" />
          <Text style={styles.simHeader}>
            {I18nService.t('tutorial.liveSimHeader')}
          </Text>
        </View>

        <View style={styles.canvasContainer}>
          <Svg width={300} height={240}>
            {/* Dynamic Rope */}
            <Line
              x1={catX}
              y1={catY}
              x2={bombX}
              y2={bombY}
              stroke="#EC4899"
              strokeWidth={5}
              strokeLinecap="round"
            />



            {/* Cat Sprite */}
            <SvgImage
              href={SpriteAssets.cat}
              x={catX - 20}
              y={catY - 20}
              width={40}
              height={40}
            />

            {/* Bomb Sprite */}
            <SvgImage
              href={SpriteAssets.bomb}
              x={bombX - 20}
              y={bombY - 20}
              width={40}
              height={40}
            />
          </Svg>

          {/* Interactive Practice Button */}
          <TouchableOpacity style={[styles.practiceButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]} activeOpacity={0.8} onPress={handlePracticeTap}>
            <Sparkles size={18} color="#FFFFFF" />
            <Text style={styles.practiceText}>
              {`${I18nService.t('tutorial.practiceTap')} (${practiceScore})`}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.simHintBox, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <ArrowUp size={18} color={isPointingUp ? '#FACC15' : '#64748B'} />
          <Text style={[styles.simHint, { color: isPointingUp ? '#FACC15' : '#94A3B8' }]}>
            {isPointingUp
              ? I18nService.t('tutorial.hintPerfect')
              : I18nService.t('tutorial.hintWait')}
          </Text>
        </View>
      </View>

      {/* Instructional Steps */}
      <View style={styles.instructionsList}>
        <View style={[styles.instructionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <CheckCircle2 size={18} color="#06B6D4" />
          <Text style={[styles.instructionText, { textAlign: isRTL ? 'right' : 'left' }]}>
            {I18nService.t('tutorial.step1Text')}
          </Text>
        </View>

        <View style={[styles.instructionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <CheckCircle2 size={18} color="#FACC15" />
          <Text style={[styles.instructionText, { textAlign: isRTL ? 'right' : 'left' }]}>
            {I18nService.t('tutorial.step2Text')}
          </Text>
        </View>

        <View style={[styles.instructionRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <CheckCircle2 size={18} color="#EC4899" />
          <Text style={[styles.instructionText, { textAlign: isRTL ? 'right' : 'left' }]}>
            {I18nService.t('tutorial.step3Text')}
          </Text>
        </View>
      </View>

      {/* Start Main Game Button */}
      <TouchableOpacity style={[styles.startGameButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]} activeOpacity={0.8} onPress={onStartGame}>
        <Play size={22} color="#FFFFFF" fill="#FFFFFF" />
        <Text style={styles.startGameText}>
          {I18nService.t('tutorial.startRealGame')}
        </Text>
      </TouchableOpacity>
    </View>
  </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 48,
    justifyContent: 'space-between',
  },
  headerRow: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  titleGroup: {
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  simCard: {
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 16,
    borderWidth: 2,
    borderColor: '#06B6D4',
    alignItems: 'center',
  },
  simHeaderGroup: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  simHeader: {
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  canvasContainer: {
    width: 300,
    height: 250,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  practiceButton: {
    position: 'absolute',
    bottom: 12,
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EC4899',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  practiceText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  simHintBox: {
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  simHint: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  instructionsList: {
    gap: 10,
  },
  instructionRow: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  instructionText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    lineHeight: 18,
  },
  startGameButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#EC4899',
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  startGameText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
