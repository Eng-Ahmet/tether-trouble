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
    <View style={styles.hudContainer} pointerEvents="none">
      {/* High Score Badge */}
      <View style={styles.badgeRow}>
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

      {/* Main Dynamic Score Display */}
      <View style={styles.scoreBox}>
        <Text style={styles.scoreText}>{score}</Text>
      </View>

      {/* Combo Indicator */}
      {combo > 1 && (
        <View style={[styles.comboContainer, combo >= 4 && styles.comboContainerHot]}>
          <Flame size={20} color={combo >= 4 ? '#FFFFFF' : '#F97316'} />
          <Text style={styles.comboText}>
            {combo >= 8 ? `🔥 MAX 8x ${I18nService.t('game.combo')}` : `${combo}x ${I18nService.t('game.combo')}`}
          </Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  hudContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
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
  scoreBox: {
    alignItems: 'center',
  },
  scoreText: {
    color: '#FFFFFF',
    fontSize: 64,
    fontWeight: '900',
    letterSpacing: -2,
    textShadowColor: 'rgba(6, 182, 212, 0.75)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 12,
  },
  comboContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F97316',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 4,
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
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
});
