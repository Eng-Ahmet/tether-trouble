import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { Play, Settings, Trophy, User, BookOpen, MessageSquare, Award, Info, Shield } from 'lucide-react-native';
import { SpriteAssets } from '../../assets/spriteAssets';
import { I18nService } from '../../i18n';
import { StorageService } from '../../services/StorageService';
import { audioHaptics } from '../../services/AudioHapticsService';
import { LanguageSwitcher } from '../../components/LanguageSwitcher/LanguageSwitcher';

interface MainMenuScreenProps {
  onStartGame: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenTutorial: () => void;
  onOpenAbout: () => void;
  onOpenPrivacy: () => void;
  onOpenBadges: () => void;
}

export const MainMenuScreen: React.FC<MainMenuScreenProps> = ({
  onStartGame,
  onOpenSettings,
  onOpenProfile,
  onOpenTutorial,
  onOpenAbout,
  onOpenPrivacy,
  onOpenBadges,
}) => {
  const [, setLangTick] = useState<number>(0);
  const [randomCatQuote, setRandomCatQuote] = useState<string>(I18nService.getRandomQuote());
  const highScore = StorageService.getHighScoreSync();
  const isRTL = I18nService.isRTL();

  useEffect(() => {
    // Pick a new dynamic quote when menu mounts or language changes
    setRandomCatQuote(I18nService.getRandomQuote());

    return I18nService.subscribe(() => {
      setLangTick((prev) => prev + 1);
      setRandomCatQuote(I18nService.getRandomQuote());
    });
  }, []);

  const handlePlayPress = () => {
    audioHaptics.playTapSlingSFX();
    audioHaptics.triggerMediumHaptic();
    onStartGame();
  };

  const handleQuotePress = () => {
    audioHaptics.playTapSlingSFX();
    audioHaptics.triggerLightHaptic();
    setRandomCatQuote(I18nService.getRandomQuote());
  };

  return (
    <ImageBackground source={SpriteAssets.menuBg} style={styles.backgroundImage} resizeMode="cover">
      <View style={styles.container}>
        {/* Top Header Row with Language Switcher */}
        <View style={[styles.topRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.highScoreBadge} activeOpacity={0.8} onPress={onOpenProfile}>
            <Trophy size={16} color="#FACC15" />
            <Text style={styles.highScoreText}>{highScore}</Text>
          </TouchableOpacity>

          <LanguageSwitcher />
        </View>

        {/* Hero Cyber Cat (Large Static Size + Dynamic Witty Quote Bubble) */}
        <View style={styles.heroSection}>
          <Image
            source={SpriteAssets.cat}
            style={styles.heroImageLarge}
            resizeMode="contain"
          />

          <Text style={styles.titleText}>{I18nService.t('app.name')}</Text>

          <TouchableOpacity
            style={[styles.quoteCard, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
            activeOpacity={0.85}
            onPress={handleQuotePress}
          >
            <MessageSquare size={16} color="#FACC15" />
            <Text style={styles.quoteCardText}>"{randomCatQuote}"</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Action Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity style={styles.playButton} activeOpacity={0.8} onPress={handlePlayPress}>
            <Play size={26} color="#FFFFFF" fill="#FFFFFF" />
            <Text style={styles.playText}>{I18nService.t('menu.play')}</Text>
          </TouchableOpacity>

          {/* Primary Action Button Row (Profile, Badges, Settings) */}
          <View style={[styles.subButtonRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity style={styles.subButton} activeOpacity={0.8} onPress={onOpenProfile}>
              <User size={16} color="#EC4899" />
              <Text style={[styles.subButtonText, { color: '#EC4899' }]}>
                {I18nService.t('menu.profile')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.subButton} activeOpacity={0.8} onPress={onOpenBadges}>
              <Award size={16} color="#FACC15" />
              <Text style={[styles.subButtonText, { color: '#FACC15' }]}>
                {I18nService.t('profile.badgesHeader').split(' ')[0]}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.subButton} activeOpacity={0.8} onPress={onOpenSettings}>
              <Settings size={16} color="#06B6D4" />
              <Text style={styles.subButtonText}>{I18nService.t('menu.settings')}</Text>
            </TouchableOpacity>
          </View>

          {/* Secondary Action Button Row (Practice, About Us, Privacy Policy) */}
          <View style={[styles.subButtonRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={onOpenTutorial}>
              <BookOpen size={14} color="#38BDF8" style={{ marginRight: 4 }} />
              <Text style={[styles.secondaryButtonText, { color: '#38BDF8' }]}>
                {I18nService.t('menu.practice')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={onOpenAbout}>
              <Info size={14} color="#EC4899" style={{ marginRight: 4 }} />
              <Text style={styles.secondaryButtonText}>{I18nService.t('about.title')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8} onPress={onOpenPrivacy}>
              <Shield size={14} color="#06B6D4" style={{ marginRight: 4 }} />
              <Text style={styles.secondaryButtonText}>{I18nService.t('privacy.title')}</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 54,
    paddingBottom: 74,
  },
  topRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
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
    width: '100%',
  },
  heroImageLarge: {
    width: 180,
    height: 180,
    marginBottom: 10,
  },
  titleText: {
    color: '#EC4899',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  quoteCard: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    marginTop: 10,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#334155',
    maxWidth: '90%',
  },
  quoteCardText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  buttonSection: {
    width: '100%',
    gap: 12,
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
  subButtonRow: {
    width: '100%',
    gap: 8,
  },
  subButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  subButtonText: {
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: '800',
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  secondaryButtonText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
});
