import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { AssetPreloaderService } from '../../services/AssetPreloaderService';
import { SpriteAssets } from '../../assets/spriteAssets';
import { I18nService } from '../../i18n';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Initializing...');
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    // Pulse logo animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Start asset preloader
    AssetPreloaderService.initialize((prog, status) => {
      setProgress(prog);
      setStatusText(status);

      if (prog >= 1.0) {
        setTimeout(() => {
          onFinish();
        }, 400);
      }
    });
  }, [onFinish, pulseAnim]);

  const percentInt = Math.min(Math.round(progress * 100), 100);
  const isRTL = I18nService.isRTL();

  return (
    <View style={styles.container}>
      {/* Centered Cyberpunk Logo Icon */}
      <Animated.View style={[styles.logoBox, { transform: [{ scale: pulseAnim }] }]}>
        <Image source={SpriteAssets.cat} style={styles.catImage} resizeMode="contain" />
      </Animated.View>

      <Text style={styles.titleText}>{I18nService.t('app.name')}</Text>
      <Text style={styles.subtitleText}>{I18nService.t('app.subtitle')}</Text>

      {/* Progress Section */}
      <View style={styles.progressSection}>
        <Text style={[styles.statusText, { textAlign: isRTL ? 'right' : 'left' }]}>{statusText}</Text>

        {/* Progress Bar Outer */}
        <View style={styles.progressBarTrack}>
          <View style={[styles.progressBarFill, { width: `${percentInt}%` }]} />
        </View>

        <Text style={styles.percentText}>{percentInt}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoBox: {
    width: 140,
    height: 140,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catImage: {
    width: 140,
    height: 140,
  },
  titleText: {
    color: '#EC4899',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
  },
  subtitleText: {
    color: '#FACC15',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
    marginBottom: 48,
  },
  progressSection: {
    width: '100%',
    maxWidth: 280,
    alignItems: 'center',
  },
  statusText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
    width: '100%',
  },
  progressBarTrack: {
    width: '100%',
    height: 12,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#06B6D4',
    borderRadius: 8,
  },
  percentText: {
    color: '#06B6D4',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 8,
  },
});
