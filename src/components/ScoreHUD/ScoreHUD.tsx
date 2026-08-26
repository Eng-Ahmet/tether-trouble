import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Trophy, Flame, Zap } from 'lucide-react-native';
import { I18nService } from '../../i18n';

interface ScoreHUDProps {
  score: number;
  highScore: number;
  combo: number;
  nearMissCount: number;
}

export const ScoreHUD: React.FC<ScoreHUDProps> = React.memo(({ score, highScore, combo, nearMissCount }) => {
  return (
    <View style={styles.hudContainer} pointerEvents="box-none">
      {/* Top Header Row with Score on Right */}
      <View style={styles.topRow}>
        {/* Left Side Badges: Best Score & Near Miss */}
        <View style={styles.badgesGroup}>
          <View style={styles.badge}>
            <Trophy size={14} color="#FACC15" />
            <Text style={styles.badgeText}>{I18nService.t('game.best')} {highScore}</Text>
          </View>

          {nearMissCount > 0 && (
            <View style={[styles.badge, styles.nearMissBadge]}>
              <Zap size={14} color="#38BDF8" />
              <Text style={[styles.badgeText, { color: '#38BDF8' }]}>{I18nService.t('game.slip')} {nearMissCount}</Text>
            </View>
          )}
        </View>

        {/* Top Right Main Score Display */}
        <View style={styles.scoreRightBox} pointerEvents="none">
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </View>

      {/* Combo Indicator */}
      {combo > 1 && (
        <View style={[styles.comboContainer, combo >= 4 && styles.comboContainerHot]} pointerEvents="none">
          <Flame size={18} color={combo >= 4 ? '#FFFFFF' : '#F97316'} />
          <Text style={styles.comboText}>
            {combo >= 8 ? `MAX 8x ${I18nService.t('game.combo')}` : `${combo}x ${I18nService.t('game.combo')}`}
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  hudContainer: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  badgesGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(250, 204, 21, 0.4)',
  },
  nearMissBadge: {
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  badgeText: {
    color: '#FACC15',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scoreRightBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#06B6D4',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    textShadowColor: 'rgba(6, 182, 212, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  comboContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#F97316',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    marginTop: 8,
    transform: [{ rotate: '-3deg' }],
  },
  comboContainerHot: {
    backgroundColor: '#EC4899',
    shadowColor: '#EC4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  comboText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
