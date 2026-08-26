import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Play, Sparkles, Navigation, Target } from 'lucide-react-native';
import { SpriteAssets } from '../../assets/spriteAssets';
import { I18nService } from '../../i18n';
import { audioHaptics } from '../../services/AudioHapticsService';

interface TutorialModalProps {
  onStart: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ onStart }) => {
  const isRTL = I18nService.isRTL();

  const handleStart = () => {
    audioHaptics.playTapSlingSFX();
    audioHaptics.triggerMediumHaptic();
    onStart();
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <Text style={styles.titleText}>
          {isRTL ? 'طريقة التحكم واللعب' : 'HOW TO CONTROL & PLAY'}
        </Text>
        <Text style={styles.subtitleText}>
          {isRTL ? 'تعلم سر الأرجحة في 3 خطوات بسيطة' : 'Master Slingshot Timing in 3 Steps'}
        </Text>

        {/* Step 1: Continuous Rotation */}
        <View style={[styles.stepRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.iconBox}>
            <Image source={SpriteAssets.cat} style={styles.spriteIcon} resizeMode="contain" />
          </View>
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? '1. الدوران المستمر' : '1. CONTINUOUS SPIN'}
            </Text>
            <Text style={[styles.stepDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL
                ? 'القط والقنبلة يدوران حول بعضهما بحبل نيون متصل باستمرار.'
                : 'The Cat and Bomb continuously spin around each other on an elastic rope.'}
            </Text>
          </View>
        </View>

        {/* Step 2: Perfect Tap Timing */}
        <View style={[styles.stepRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.iconBox, styles.tapBox]}>
            <Image source={SpriteAssets.bomb} style={styles.spriteIcon} resizeMode="contain" />
          </View>
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? '2. التوقيت المناسب' : '2. PERFECT TAP TIMING'}
            </Text>
            <Text style={[styles.stepDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL
                ? 'عندما يتجه العنصر المترجح للأعلى، اضغط في أي مكان بالشاشة لإطلاقه كالمنجنيق!'
                : 'When the swinging entity points UPWARDS, tap anywhere on screen to catapult forward!'}
            </Text>
          </View>
        </View>

        {/* Step 3: Score & Avoid Hazards */}
        <View style={[styles.stepRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.iconBox, styles.hazardBox]}>
            <Image source={SpriteAssets.gate} style={styles.spriteIcon} resizeMode="contain" />
          </View>
          <View style={styles.stepContent}>
            <Text style={[styles.stepTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL ? '3. العبور وجمع النقاط' : '3. PASS GATES & SCORE'}
            </Text>
            <Text style={[styles.stepDesc, { textAlign: isRTL ? 'right' : 'left' }]}>
              {isRTL
                ? 'اعبر من وسط فتحة البوابات، وتجنب ملامسة المناشير أو جدران الشاشة!'
                : 'Pass cleanly through gate gaps and avoid sawblades or screen boundary walls!'}
            </Text>
          </View>
        </View>

        {/* Start Game Button */}
        <TouchableOpacity style={styles.startButton} activeOpacity={0.8} onPress={handleStart}>
          <Play size={22} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.startText}>
            {isRTL ? 'فهمت، ابدأ اللعب الآن' : 'GOT IT, START PLAYING NOW'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.94)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 48,
    zIndex: 150,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 22,
    borderWidth: 2,
    borderColor: '#06B6D4',
  },
  titleText: {
    color: '#EC4899',
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  subtitleText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  stepRow: {
    backgroundColor: '#0F172A',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(236, 72, 153, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#EC4899',
  },
  tapBox: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: '#06B6D4',
  },
  hazardBox: {
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
    borderColor: '#FACC15',
  },
  spriteIcon: {
    width: 32,
    height: 32,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    color: '#FACC15',
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 3,
  },
  stepDesc: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#EC4899',
    paddingVertical: 16,
    borderRadius: 18,
    marginTop: 8,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  startText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
