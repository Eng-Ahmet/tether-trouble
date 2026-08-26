import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated, ImageBackground } from 'react-native';
import { ArrowLeft, ArrowRight, Home, Code, Heart, Sparkles, ShieldCheck } from 'lucide-react-native';
import { SpriteAssets } from '../../assets/spriteAssets';
import { I18nService } from '../../i18n';

interface AboutModalProps {
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  const [, setLangTick] = useState<number>(0);
  const isRTL = I18nService.isRTL();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }),
    ]).start();

    return I18nService.subscribe(() => {
      setLangTick((prev) => prev + 1);
    });
  }, [fadeAnim, slideAnim]);

  return (
    <ImageBackground source={SpriteAssets.menuBg} style={styles.backgroundImage} resizeMode="cover">
      <Animated.View style={[styles.fullScreenContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Header Row */}
        <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onClose}>
            {isRTL ? <ArrowRight size={20} color="#06B6D4" /> : <ArrowLeft size={20} color="#06B6D4" />}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{I18nService.t('about.title')}</Text>
          <TouchableOpacity style={styles.homeButton} activeOpacity={0.7} onPress={onClose}>
            <Home size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true} indicatorStyle="white">
          {/* Logo Hero Card */}
          <View style={styles.heroSection}>
            <Image source={SpriteAssets.cat} style={styles.heroImage} resizeMode="contain" />
            <Text style={styles.appNameText}>{I18nService.t('app.name')}</Text>
            <Text style={styles.appSubText}>{I18nService.t('app.subtitle')}</Text>
          </View>

          {/* Orivex Tech Team Card */}
          <View style={styles.card}>
            <View style={[styles.cardHeaderRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Code size={22} color="#EC4899" />
              <Text style={styles.cardHeaderTitle}>{I18nService.t('about.developerHeader')}</Text>
            </View>
            <Text style={[styles.cardBodyText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {I18nService.t('about.developerDesc')}
            </Text>
          </View>

          {/* Dedicated to Arab Community & Creators Card */}
          <View style={[styles.card, styles.cardDedication]}>
            <View style={[styles.cardHeaderRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Heart size={22} color="#FACC15" />
              <Text style={[styles.cardHeaderTitle, { color: '#FACC15' }]}>
                {I18nService.t('about.dedicationHeader')}
              </Text>
            </View>
            <Text style={[styles.cardBodyText, { textAlign: isRTL ? 'right' : 'left' }]}>
              {I18nService.t('about.dedicationDesc')}
            </Text>
          </View>

          {/* Action Close / Return Button */}
          <TouchableOpacity style={[styles.doneButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]} activeOpacity={0.8} onPress={onClose}>
            <Home size={18} color="#FFFFFF" />
            <Text style={styles.doneText}>{I18nService.t('profile.returnHome')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingTop: 54,
    paddingBottom: 24,
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  homeButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
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
  scrollContent: {
    gap: 16,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  heroImage: {
    width: 90,
    height: 90,
    marginBottom: 8,
  },
  appNameText: {
    color: '#EC4899',
    fontSize: 26,
    fontWeight: '900',
  },
  appSubText: {
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#EC4899',
    gap: 12,
  },
  cardDedication: {
    borderColor: 'rgba(250, 204, 21, 0.6)',
  },
  cardHeaderRow: {
    alignItems: 'center',
    gap: 10,
  },
  cardHeaderTitle: {
    color: '#EC4899',
    fontSize: 16,
    fontWeight: '900',
  },
  cardBodyText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
  },
  doneButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
