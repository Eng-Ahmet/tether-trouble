import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Play, Settings, Trophy } from 'lucide-react-native';
import { SpriteAssets } from '../../assets/spriteAssets';
import { I18nService } from '../../i18n';
import { StorageService } from '../../services/StorageService';
import { audioHaptics } from '../../services/AudioHapticsService';
import { LanguageSwitcher } from '../../components/LanguageSwitcher/LanguageSwitcher';

interface MainMenuScreenProps {
  onStartGame: () => void;
  onOpenSettings: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({ onStartGame, onOpenSettings }) => {
  const [, setLangTick] = useState<number>(0);
  const highScore = StorageService.getHighScoreSync();
  const isRTL = I18nService.isRTL();

  useEffect(() => {
    return I18nService.subscribe(() => {
      setLangTick((prev) => prev + 1);
    });
  }, []);

  const handlePlayPress = () => {
    audioHaptics.playTapSlingSFX();
    audioHaptics.triggerMediumHaptic();
    onStartGame();
  };

  const handleSettingsPress = () => {
    audioHaptics.triggerLightHaptic();
    onOpenSettings();
  };

  return (
    <View style={styles.container}>
      {/* Top Header Row with Language Switcher */}
      <View style={[styles.topRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={styles.highScoreBadge}>
          <Trophy size={16} color="#FACC15" />
          <Text style={styles.highScoreText}>{highScore}</Text>
        </View>

        <LanguageSwitcher />
      </View>

      {/* Hero Visual */}
      <View style={styles.heroSection}>
        <Image source={SpriteAssets.cat} style={styles.heroImage} resizeMode="contain" />
        <Text style={styles.titleText}>{I18nService.t('app.name')}</Text>
        <Text style={styles.subTitleText}>{I18nService.t('app.subtitle')}</Text>
      </View>

      {/* Menu Action Buttons */}
      <View style={styles.buttonSection}>
        <TouchableOpacity style={styles.playButton} activeOpacity={0.8} onPress={handlePlayPress}>
          <Play size={26} color="#FFFFFF" fill="#FFFFFF" />
          <Text style={styles.playText}>{I18nService.t('menu.play')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingsButton} activeOpacity={0.8} onPress={handleSettingsPress}>
          <Settings size={20} color="#06B6D4" />
          <Text style={styles.settingsText}>{I18nService.t('menu.settings')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 48,
  },
  topRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  highScoreBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.4)',
  },
  highScoreText: {
    color: '#FACC15',
    fontSize: 14,
    fontWeight: '900',
  },
  heroSection: {
    alignItems: 'center',
  },
  heroImage: {
    width: 160,
    height: 160,
    marginBottom: 16,
  },
  titleText: {
    color: '#EC4899',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
    textAlign: 'center',
  },
  subTitleText: {
    color: '#FACC15',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
  },
  buttonSection: {
    width: '100%',
    gap: 14,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: '#EC4899',
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  playText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  settingsText: {
    color: '#06B6D4',
    fontSize: 16,
    fontWeight: '800',
  },
});
