import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Animated, ImageBackground } from 'react-native';
import { ArrowLeft, ArrowRight, Volume2, VolumeX, Smartphone, BarChart2, Home } from 'lucide-react-native';
import { SpriteAssets } from '../../assets/spriteAssets';
import { I18nService } from '../../i18n';
import { StorageService } from '../../services/StorageService';
import { audioHaptics } from '../../services/AudioHapticsService';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [, setLangTick] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(audioHaptics.isSoundEnabled());
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(audioHaptics.isHapticsEnabled());
  const stats = StorageService.getStatsSync();
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

  const handleToggleSound = (value: boolean) => {
    audioHaptics.setSoundEnabled(value);
    setSoundEnabled(value);
    if (value) audioHaptics.playTapSlingSFX();
    StorageService.saveSettings({ soundEnabled: value });
  };

  const handleToggleHaptics = (value: boolean) => {
    audioHaptics.setHapticsEnabled(value);
    setHapticsEnabled(value);
    if (value) audioHaptics.triggerLightHaptic();
    StorageService.saveSettings({ hapticsEnabled: value });
  };

  return (
    <ImageBackground source={SpriteAssets.menuBg} style={styles.backgroundImage} resizeMode="cover">
      <Animated.View style={[styles.fullScreenContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Top Navigation Bar with Dynamic RTL Back & Home Button */}
        <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onClose}>
            {isRTL ? <ArrowRight size={20} color="#06B6D4" /> : <ArrowLeft size={20} color="#06B6D4" />}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{I18nService.t('settings.title')}</Text>
          <TouchableOpacity style={styles.homeButton} activeOpacity={0.7} onPress={onClose}>
            <Home size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Audio Controls */}
          <View style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { textAlign: isRTL ? 'right' : 'left' }]}>
              {I18nService.t('settings.audioSettings')}
            </Text>

            <View style={[styles.settingRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.labelGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {soundEnabled ? <Volume2 size={20} color="#EC4899" /> : <VolumeX size={20} color="#64748B" />}
                <Text style={styles.settingLabel}>{I18nService.t('settings.soundFX')}</Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={handleToggleSound}
                trackColor={{ false: '#334155', true: '#EC4899' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={[styles.settingRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <View style={[styles.labelGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Smartphone size={20} color={hapticsEnabled ? '#06B6D4' : '#64748B'} />
                <Text style={styles.settingLabel}>{I18nService.t('settings.vibration')}</Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={handleToggleHaptics}
                trackColor={{ false: '#334155', true: '#06B6D4' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Quick Player Stats */}
          <View style={styles.sectionCard}>
            <View style={[styles.statsHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <BarChart2 size={20} color="#38BDF8" />
              <Text style={styles.statsHeaderText}>{I18nService.t('settings.quickStats')}</Text>
            </View>

            <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.statLabel}>{I18nService.t('settings.gamesPlayed')}</Text>
              <Text style={styles.statVal}>{stats.gamesPlayed}</Text>
            </View>

            <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.statLabel}>{I18nService.t('settings.totalScore')}</Text>
              <Text style={styles.statVal}>{stats.totalNearMisses}</Text>
            </View>

            <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={styles.statLabel}>{I18nService.t('settings.maxCombo')}</Text>
              <Text style={styles.statVal}>{stats.bestCombo}x</Text>
            </View>
          </View>

          {/* Save / Back Button */}
          <TouchableOpacity style={styles.doneButton} activeOpacity={0.8} onPress={onClose}>
            <Text style={styles.doneText}>{I18nService.t('settings.done')}</Text>
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
    marginBottom: 20,
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
    fontSize: 20,
    fontWeight: '900',
  },
  scrollContent: {
    gap: 18,
    paddingBottom: 20,
  },
  sectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  sectionTitle: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 14,
  },
  settingRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  labelGroup: {
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  statsHeader: {
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  statsHeaderText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statsRow: {
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#0F172A',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  doneButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
