import React, { useEffect, useState, useRef } from 'react';
import { Text, StyleSheet, Animated, ImageBackground } from 'react-native';
import { AssetPreloaderService } from '../../services/AssetPreloaderService';
import { SpriteAssets } from '../../assets/spriteAssets';
import { I18nService } from '../../i18n';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [statusText, setStatusText] = useState<string>(I18nService.t('splash.loading'));
  const [progress, setProgress] = useState<number>(0);

  const fadeOutAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  const mountedRef = useRef<boolean>(true);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    // Elegant pulsing animation for loading indicator
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
      ])
    );
    pulseLoop.start();

    const runPreloadAndHold = async () => {
      // 1. Critical Preload Execution
      await AssetPreloaderService.initialize((prog, status) => {
        if (!mountedRef.current) return;
        setProgress(prog);
        setStatusText(status);
      });

      if (!mountedRef.current) return;

      // Ensure state is 100% complete
      setProgress(1.0);
      setStatusText(I18nService.t('splash.almostReady'));

      // 2. Mandatory 2.5 Second Branded Hold AFTER Preload Completes
      holdTimerRef.current = setTimeout(() => {
        if (!mountedRef.current) return;

        // 3. Smooth Fade Out -> Main Menu
        Animated.timing(fadeOutAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (mountedRef.current) {
            onFinish();
          }
        });
      }, 2500);
    };

    runPreloadAndHold();

    return () => {
      mountedRef.current = false;
      if (holdTimerRef.current) {
        clearTimeout(holdTimerRef.current);
      }
      pulseLoop.stop();
    };
  }, [fadeOutAnim, onFinish, pulseAnim]);

  const percentage = Math.round(progress * 100);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOutAnim }]}>
      <ImageBackground
        source={SpriteAssets.splashPoster}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Sleek Floating Text & Progress Indicator */}
        <Animated.View style={[styles.bottomTextWrapper, { opacity: pulseAnim }]}>
          <Text style={styles.loadingText}>
            {statusText} • {percentage}%
          </Text>
        </Animated.View>
      </ImageBackground>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomTextWrapper: {
    position: 'absolute',
    bottom: 54,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.4)',
  },
  loadingText: {
    color: '#06B6D4',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
    textAlign: 'center',
  },
});

