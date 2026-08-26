import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, ScrollView, Animated, ImageBackground } from 'react-native';
import { Share2, Trophy, RotateCcw, Zap, Volume2, VolumeX, Home, Crown, Flame, Award, Footprints } from 'lucide-react-native';
import { MemeFailSnapshot } from '../../types/game';
import { audioHaptics } from '../../services/AudioHapticsService';
import { I18nService } from '../../i18n';
import { SpriteAssets } from '../../assets/spriteAssets';

interface GameOverModalProps {
  snapshot: MemeFailSnapshot;
  onRestart: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = React.memo(({ snapshot, onRestart, onGoHome }) => {
  const [, setLangTick] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(audioHaptics.isSoundEnabled());
  const isRTL = I18nService.isRTL();

  // Entrance spring animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();

    return I18nService.subscribe(() => {
      setLangTick((prev) => prev + 1);
    });
  }, [fadeAnim, slideAnim]);

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${I18nService.t('app.name')}!`,
        message: `${I18nService.t('game.score')}: ${snapshot.score}! "${snapshot.quote}"\n${I18nService.t('app.name')}`,
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  const handleToggleSound = () => {
    const nextState = audioHaptics.toggleSound();
    setSoundOn(nextState);
    if (nextState) audioHaptics.playTapSlingSFX();
  };

  // Performance Rank Badge
  const getRank = (score: number) => {
    if (score >= 25) return { label: I18nService.t('ranks.sRank'), color: '#FACC15', icon: Crown };
    if (score >= 15) return { label: I18nService.t('ranks.aRank'), color: '#EC4899', icon: Flame };
    if (score >= 8) return { label: I18nService.t('ranks.bRank'), color: '#38BDF8', icon: Zap };
    return { label: I18nService.t('ranks.cRank'), color: '#94A3B8', icon: Footprints };
  };

  const rank = getRank(snapshot.score);
  const RankIcon = rank.icon;

  return (
    <View style={styles.overlayContainer}>
      <ImageBackground source={SpriteAssets.menuBg} style={styles.backgroundImage} resizeMode="cover">
        <Animated.View style={[styles.fullScreenContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          {/* Top Header Row with Home & Sound Toggle */}
          <View style={[styles.topHeaderRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity style={styles.navButton} activeOpacity={0.7} onPress={onGoHome}>
              <Home size={20} color="#06B6D4" />
            </TouchableOpacity>

            <View style={[styles.rankBadge, { borderColor: rank.color, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <RankIcon size={16} color={rank.color} />
              <Text style={[styles.rankText, { color: rank.color }]}>{rank.label}</Text>
            </View>

            <TouchableOpacity style={styles.navButton} activeOpacity={0.7} onPress={handleToggleSound}>
              {soundOn ? <Volume2 size={20} color="#38BDF8" /> : <VolumeX size={20} color="#64748B" />}
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Meme Quote Hero Card */}
            <View style={styles.memeCard}>
              <Text style={styles.failTitle}>{I18nService.t('gameOver.wasted')}</Text>

              <View style={styles.quoteBox}>
                <Text style={styles.quoteText}>"{snapshot.quote}"</Text>
              </View>

              <View style={[styles.deathCauseBadge, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={styles.deathCauseText}>{snapshot.deathCause}</Text>
              </View>
            </View>

            {/* Score & Best Summary Card */}
            <View style={styles.scoreCard}>
              <View style={styles.scoreRow}>
                <View style={styles.scoreColumn}>
                  <Text style={styles.scoreVal}>{snapshot.score}</Text>
                  <Text style={styles.scoreLbl}>{I18nService.t('game.score')}</Text>
                </View>

                <View style={styles.dividerLine} />

                <View style={styles.scoreColumn}>
                  <View style={[styles.bestRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Trophy size={16} color="#FACC15" />
                    <Text style={styles.bestVal}>{snapshot.highScore}</Text>
                  </View>
                  <Text style={styles.scoreLbl}>{I18nService.t('game.best')}</Text>
                </View>
              </View>

              {/* Combo & Near-Miss Stats */}
              <View style={[styles.subStatsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.subStatPill, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Zap size={14} color="#06B6D4" />
                  <Text style={styles.subStatText}>
                    {snapshot.nearMissCount} {I18nService.t('game.slip')}
                  </Text>
                </View>

                <View style={[styles.subStatPill, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Flame size={14} color="#EC4899" />
                  <Text style={styles.subStatText}>{snapshot.maxCombo}x MAX</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons Row */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity style={styles.restartButton} activeOpacity={0.85} onPress={onRestart}>
                <RotateCcw size={24} color="#FFFFFF" />
                <Text style={styles.restartText}>{I18nService.t('gameOver.playAgain')}</Text>
              </TouchableOpacity>

              <View style={[styles.secondaryRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <TouchableOpacity style={styles.homeActionButton} activeOpacity={0.8} onPress={onGoHome}>
                  <Home size={18} color="#94A3B8" />
                  <Text style={styles.homeActionText}>{I18nService.t('gameOver.menu')}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.shareButton} activeOpacity={0.8} onPress={handleShare}>
                  <Share2 size={18} color="#06B6D4" />
                  <Text style={styles.shareText}>{I18nService.t('gameOver.share')}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.tipText}>{I18nService.t('gameOver.tip')}</Text>
          </ScrollView>
        </Animated.View>
      </ImageBackground>
    </View>
  );
});

const styles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    backgroundColor: '#0F172A',
  },
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
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  topHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  rankBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 8,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scrollContent: {
    alignItems: 'center',
    gap: 16,
    paddingBottom: 24,
  },
  memeCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  failTitle: {
    color: '#EF4444',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12,
  },
  quoteBox: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  quoteText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  deathCauseBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  deathCauseText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '800',
  },
  scoreCard: {
    width: '100%',
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 16,
  },
  scoreColumn: {
    alignItems: 'center',
    flex: 1,
  },
  scoreVal: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '900',
  },
  bestRow: {
    alignItems: 'center',
    gap: 6,
  },
  bestVal: {
    color: '#FACC15',
    fontSize: 36,
    fontWeight: '900',
  },
  scoreLbl: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  dividerLine: {
    width: 1.5,
    height: 44,
    backgroundColor: '#334155',
  },
  subStatsRow: {
    justifyContent: 'center',
    gap: 12,
    width: '100%',
  },
  subStatPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  subStatText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '800',
  },
  actionButtonsContainer: {
    width: '100%',
    gap: 12,
  },
  restartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#EC4899',
    paddingVertical: 18,
    borderRadius: 20,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  restartText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  secondaryRow: {
    width: '100%',
    gap: 10,
  },
  homeActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  homeActionText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '800',
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#06B6D4',
  },
  shareText: {
    color: '#06B6D4',
    fontSize: 14,
    fontWeight: '900',
  },
  tipText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 4,
  },
});
