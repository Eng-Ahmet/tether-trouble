import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share } from 'react-native';
import { Share2, Trophy, RotateCcw, Zap, Volume2, VolumeX } from 'lucide-react-native';
import { MemeFailSnapshot } from '../../types/game';
import { audioHaptics } from '../../services/AudioHapticsService';
import { I18nService } from '../../i18n';
import { LanguageSwitcher } from '../../components/LanguageSwitcher/LanguageSwitcher';

interface GameOverModalProps {
  snapshot: MemeFailSnapshot;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = React.memo(({ snapshot, onRestart }) => {
  const [, setLangTick] = useState<number>(0);
  const [soundOn, setSoundOn] = useState<boolean>(audioHaptics.isSoundEnabled());
  const isRTL = I18nService.isRTL();

  useEffect(() => {
    return I18nService.subscribe(() => {
      setLangTick((prev) => prev + 1);
    });
  }, []);

  const handleShare = async () => {
    try {
      await Share.share({
        title: `${I18nService.t('app.name')}!`,
        message: `🔥 ${I18nService.t('game.score')}: ${snapshot.score}! ${snapshot.quote}\n${I18nService.t('app.name')} 🐱💥`,
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
    if (score >= 25) return { label: 'S RANK 👑', color: '#FACC15' };
    if (score >= 15) return { label: 'A RANK 🔥', color: '#EC4899' };
    if (score >= 8) return { label: 'B RANK ⚡', color: '#38BDF8' };
    return { label: 'C RANK 🐾', color: '#94A3B8' };
  };

  const rank = getRank(snapshot.score);

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Top Sound Toggle & Rank Banner */}
        <View style={[styles.topHeaderRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.rankBadge, { borderColor: rank.color }]}>
            <Text style={[styles.rankText, { color: rank.color }]}>{rank.label}</Text>
          </View>

          <View style={[styles.headerControls, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <LanguageSwitcher />

            <TouchableOpacity style={styles.soundButton} activeOpacity={0.7} onPress={handleToggleSound}>
              {soundOn ? <Volume2 size={18} color="#38BDF8" /> : <VolumeX size={18} color="#64748B" />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Viral Meme Header Banner */}
        <View style={styles.quoteBox}>
          <Text style={styles.quoteText}>"{snapshot.quote}"</Text>
        </View>

        {/* Fail Snapshot Stats */}
        <View style={[styles.scoreRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>{I18nService.t('game.score')}</Text>
            <Text style={styles.statValue}>{snapshot.score}</Text>
          </View>

          <View style={[styles.statBox, styles.statBoxHighlight]}>
            <Trophy size={18} color="#FACC15" />
            <Text style={styles.statLabel}>{I18nService.t('game.best')}</Text>
            <Text style={[styles.statValue, { color: '#FACC15' }]}>{snapshot.highScore}</Text>
          </View>

          <View style={styles.statBox}>
            <Zap size={18} color="#38BDF8" />
            <Text style={styles.statLabel}>{I18nService.t('game.combo')}</Text>
            <Text style={[styles.statValue, { color: '#38BDF8' }]}>{snapshot.maxCombo}x</Text>
          </View>
        </View>

        {/* Death Cause Tag */}
        <View style={styles.causeTag}>
          <Text style={styles.causeText}>{snapshot.deathCause}</Text>
        </View>

        {/* Action Buttons */}
        <View style={[styles.buttonRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.restartButton} activeOpacity={0.8} onPress={onRestart}>
            <RotateCcw size={24} color="#FFFFFF" />
            <Text style={styles.restartText}>{I18nService.t('gameOver.retry')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.shareButton} activeOpacity={0.8} onPress={handleShare}>
            <Share2 size={22} color="#06B6D4" />
          </TouchableOpacity>
        </View>

        <Text style={styles.tipText}>{I18nService.t('gameOver.tip')}</Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 100,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#334155',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  topHeaderRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 16,
  },
  headerControls: {
    alignItems: 'center',
    gap: 8,
  },
  rankBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#0F172A',
    borderWidth: 1,
  },
  rankText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  soundButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  quoteBox: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EC4899',
    marginBottom: 20,
    width: '100%',
  },
  quoteText: {
    color: '#EC4899',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  scoreRow: {
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 14,
    marginHorizontal: 4,
  },
  statBoxHighlight: {
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.4)',
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
  },
  causeTag: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 20,
  },
  causeText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
  },
  buttonRow: {
    gap: 12,
    width: '100%',
    marginBottom: 12,
  },
  restartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#EC4899',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  restartText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  shareButton: {
    width: 54,
    height: 54,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#06B6D4',
  },
  tipText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
  },
});
