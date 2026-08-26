import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, ImageBackground } from 'react-native';
import { AssetPreloaderService } from '../../services/AssetPreloaderService';
import { SpriteAssets } from '../../assets/spriteAssets';
import { I18nService } from '../../i18n';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [statusText, setStatusText] = useState<string>(I18nService.t('splash.loading'));

  const fadeOutAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    // Elegant pulsing animation for loading text (no progress bar)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.5, duration: 800, useNativeDriver: true }),
      ])
    ).start();

    // Fast asset preloader
    AssetPreloaderService.initialize((prog, status) => {
      setStatusText(status);

      if (prog >= 1.0) {
        // Hold splash screen for 2.0s to view clean artwork
        setTimeout(() => {
          Animated.timing(fadeOutAnim, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }).start(() => {
            onFinish();
          });
        }, 2000);
      }
    });
  }, [fadeOutAnim, onFinish, pulseAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOutAnim }]}>
      <ImageBackground
        source={SpriteAssets.splashPoster}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        {/* Sleek Floating Text Indicator (No Progress Bar Box) */}
        <Animated.View style={[styles.bottomTextWrapper, { opacity: pulseAnim }]}>
          <Text style={styles.loadingText}>{statusText}</Text>
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
