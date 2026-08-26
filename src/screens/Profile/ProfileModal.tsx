import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Animated, ImageBackground } from 'react-native';
import { ArrowLeft, ArrowRight, Trophy, Zap, Flame, Award, ShieldCheck, Home, Rocket, Gem, Crown, Footprints } from 'lucide-react-native';
import { SpriteAssets } from '../../assets/spriteAssets';
import { I18nService } from '../../i18n';
import { StorageService } from '../../services/StorageService';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const [, setLangTick] = useState<number>(0);
  const stats = StorageService.getStatsSync();
  const highScore = StorageService.getHighScoreSync();
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

  const getRankTitle = (score: number) => {
    if (score >= 25) return { title: I18nService.t('ranks.neonLegend'), color: '#FACC15', icon: Crown };
    if (score >= 15) return { title: I18nService.t('ranks.slingshotMaster'), color: '#EC4899', icon: Flame };
    if (score >= 8) return { title: I18nService.t('ranks.swingPro'), color: '#06B6D4', icon: Zap };
    return { title: I18nService.t('ranks.noviceFlyer'), color: '#94A3B8', icon: Footprints };
  };

  const rankInfo = getRankTitle(highScore);
  const RankIcon = rankInfo.icon;

  const achievements = [
    {
      id: 'first_flight',
      title: I18nService.t('achievements.firstFlightTitle'),
      desc: I18nService.t('achievements.firstFlightDesc'),
      unlocked: highScore >= 1,
      icon: Rocket,
    },
    {
      id: 'combo_master',
      title: I18nService.t('achievements.comboMasterTitle'),
      desc: I18nService.t('achievements.comboMasterDesc'),
      unlocked: stats.bestCombo >= 4,
      icon: Flame,
    },
    {
      id: 'near_miss_pro',
      title: I18nService.t('achievements.nearMissProTitle'),
      desc: I18nService.t('achievements.nearMissProDesc'),
      unlocked: stats.totalNearMisses >= 10,
      icon: Zap,
    },
    {
      id: 'legendary',
      title: I18nService.t('achievements.legendaryTitle'),
      desc: I18nService.t('achievements.legendaryDesc'),
      unlocked: highScore >= 20,
      icon: Gem,
    },
  ];

  return (
    <ImageBackground source={SpriteAssets.menuBg} style={styles.backgroundImage} resizeMode="cover">
      <Animated.View style={[styles.fullScreenContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Top Header Row with Dynamic RTL Back Button */}
      <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onClose}>
          {isRTL ? <ArrowRight size={20} color="#06B6D4" /> : <ArrowLeft size={20} color="#06B6D4" />}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{I18nService.t('profile.title')}</Text>
        <TouchableOpacity style={styles.homeButton} activeOpacity={0.7} onPress={onClose}>
          <Home size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Avatar Card */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarBox, { borderColor: rankInfo.color }]}>
            <Image source={SpriteAssets.cat} style={styles.avatarImage} resizeMode="contain" />
          </View>
          <View style={[styles.rankTitleGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <RankIcon size={18} color={rankInfo.color} />
            <Text style={[styles.rankTitle, { color: rankInfo.color }]}>{rankInfo.title}</Text>
          </View>
        </View>

        {/* Stats Summary Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Trophy size={20} color="#FACC15" />
            <Text style={styles.statVal}>{highScore}</Text>
            <Text style={styles.statLbl}>{I18nService.t('game.best')}</Text>
          </View>

          <View style={styles.statCard}>
            <Award size={20} color="#EC4899" />
            <Text style={styles.statVal}>{stats.gamesPlayed}</Text>
            <Text style={styles.statLbl}>{I18nService.t('stats.gamesPlayed')}</Text>
          </View>

          <View style={styles.statCard}>
            <Zap size={20} color="#06B6D4" />
            <Text style={styles.statVal}>{stats.totalNearMisses}</Text>
            <Text style={styles.statLbl}>{I18nService.t('game.slip')}</Text>
          </View>

          <View style={styles.statCard}>
            <Flame size={20} color="#F97316" />
            <Text style={styles.statVal}>{stats.bestCombo}x</Text>
            <Text style={styles.statLbl}>{I18nService.t('stats.bestCombo')}</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <Text style={[styles.sectionHeader, { textAlign: isRTL ? 'right' : 'left' }]}>
          {I18nService.t('profile.badgesHeader')}
        </Text>

        <View style={styles.achievementsList}>
          {achievements.map((ach) => {
            const AchIcon = ach.icon;
            return (
              <View
                key={ach.id}
                style={[
                  styles.achCard,
                  ach.unlocked && styles.achCardUnlocked,
                  { flexDirection: isRTL ? 'row-reverse' : 'row' },
                ]}
              >
                <View style={[styles.achIconBox, ach.unlocked && styles.achIconBoxUnlocked]}>
                  <AchIcon size={22} color={ach.unlocked ? '#FACC15' : '#64748B'} />
                </View>
                <View style={styles.achTextGroup}>
                  <Text style={[styles.achTitle, ach.unlocked && styles.achTitleUnlocked, { textAlign: isRTL ? 'right' : 'left' }]}>
                    {ach.title}
                  </Text>
                  <Text style={[styles.achDesc, { textAlign: isRTL ? 'right' : 'left' }]}>{ach.desc}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Back / Return Button */}
          <TouchableOpacity style={[styles.doneButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]} activeOpacity={0.8} onPress={onClose}>
            <Home size={18} color="#FFFFFF" />
            <Text style={styles.doneText}>
              {I18nService.t('profile.returnHome')}
            </Text>
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
    fontSize: 18,
    fontWeight: '900',
  },
  scrollContent: {
    paddingBottom: 20,
    gap: 16,
  },
  avatarSection: {
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  avatarBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: 10,
  },
  avatarImage: {
    width: 72,
    height: 72,
  },
  rankTitleGroup: {
    alignItems: 'center',
    gap: 8,
  },
  rankTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
  },
  statLbl: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionHeader: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 4,
  },
  achievementsList: {
    gap: 10,
  },
  achCard: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderRadius: 18,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: '#334155',
    opacity: 0.6,
  },
  achCardUnlocked: {
    borderColor: 'rgba(250, 204, 21, 0.5)',
    opacity: 1.0,
  },
  achIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achIconBoxUnlocked: {
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
  },
  achTextGroup: {
    flex: 1,
  },
  achTitle: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '800',
  },
  achTitleUnlocked: {
    color: '#FACC15',
  },
  achDesc: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  doneButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 10,
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
