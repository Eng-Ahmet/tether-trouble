import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, ImageBackground } from 'react-native';
import { ArrowLeft, ArrowRight, Home, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react-native';
import { SpriteAssets } from '../../assets/spriteAssets';
import { I18nService } from '../../i18n';

interface PrivacyPolicyModalProps {
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ onClose }) => {
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
          <Text style={styles.headerTitle}>{I18nService.t('privacy.title')}</Text>
          <TouchableOpacity style={styles.homeButton} activeOpacity={0.7} onPress={onClose}>
            <Home size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={true} indicatorStyle="white">
          {/* Main Security Badge Banner */}
          <View style={styles.bannerCard}>
            <ShieldCheck size={36} color="#06B6D4" />
            <Text style={styles.bannerTitle}>{I18nService.t('privacy.header')}</Text>
          </View>

          {/* Privacy Policy Content Cards */}
          <View style={styles.card}>
            <View style={[styles.itemRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <CheckCircle2 size={20} color="#06B6D4" />
              <Text style={[styles.bodyText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {I18nService.t('privacy.body1')}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={[styles.itemRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Lock size={20} color="#FACC15" />
              <Text style={[styles.bodyText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {I18nService.t('privacy.body2')}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={[styles.itemRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <ShieldCheck size={20} color="#EC4899" />
              <Text style={[styles.bodyText, { textAlign: isRTL ? 'right' : 'left' }]}>
                {I18nService.t('privacy.body3')}
              </Text>
            </View>
          </View>

          {/* Return Button */}
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
    fontSize: 16,
    fontWeight: '900',
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 40,
  },
  bannerCard: {
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#06B6D4',
    gap: 10,
  },
  bannerTitle: {
    color: '#06B6D4',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
    gap: 14,
  },
  itemRow: {
    gap: 12,
    alignItems: 'flex-start',
  },
  bodyText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 22,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#334155',
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
