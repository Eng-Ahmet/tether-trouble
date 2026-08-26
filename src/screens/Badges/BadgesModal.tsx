import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Animated, ImageBackground } from 'react-native';
import { ArrowLeft, ArrowRight, Home, Lock, Gem, ChevronDown, ChevronUp, Award } from 'lucide-react-native';
import { SpriteAssets } from '../../assets/spriteAssets';
import { I18nService } from '../../i18n';
import { StorageService } from '../../services/StorageService';

interface BadgesModalProps {
  onClose: () => void;
}

interface MysteryBadge {
  id: number;
  reason: string;
  unlocked: boolean;
}

export const BadgesModal: React.FC<BadgesModalProps> = ({ onClose }) => {
  const [, setLangTick] = useState<number>(0);
  const stats = StorageService.getStatsSync();
  const highScore = StorageService.getHighScoreSync();
  const isRTL = I18nService.isRTL();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 7, tension: 60, useNativeDriver: true }),
    ]).start();

    return I18nService.subscribe(() => {
      setLangTick((prev) => prev + 1);
    });
  }, [fadeAnim, slideAnim]);

  // Generate 500 Mystery Badges with specific unlock reasons
  const mysteryBadges = useMemo<MysteryBadge[]>(() => {
    const list: MysteryBadge[] = [];
    const isRtl = I18nService.isRTL();

    for (let i = 1; i <= 500; i++) {
      let reason = '';
      let isUnlocked = false;

      if (i === 1) {
        reason = isRtl ? 'السبب: تحقيق أول نقطة في جولة واحدة' : 'Reason: Score 1 point in a single run';
        isUnlocked = highScore >= 1;
      } else if (i === 2) {
        reason = isRtl ? 'السبب: تنفيذ أول تفادٍ قريب بنجاح' : 'Reason: Execute your first near miss slip';
        isUnlocked = stats.totalNearMisses >= 1;
      } else if (i === 3) {
        reason = isRtl ? 'السبب: خوض 3 مباريات كاملة' : 'Reason: Play 3 complete games';
        isUnlocked = stats.gamesPlayed >= 3;
      } else if (i % 10 === 0) {
        const requiredGames = i * 2;
        reason = isRtl ? `السبب: خوض ${requiredGames} مباراة كاملة` : `Reason: Play ${requiredGames} total games`;
        isUnlocked = stats.gamesPlayed >= requiredGames;
      } else if (i % 5 === 0) {
        const requiredScore = Math.floor(i / 2) + 2;
        reason = isRtl ? `السبب: تحقيق نتيجة ${requiredScore} نقطة في جولة واحدة` : `Reason: Score ${requiredScore} points in a single run`;
        isUnlocked = highScore >= requiredScore;
      } else if (i % 3 === 0) {
        const requiredSlips = i * 4;
        reason = isRtl ? `السبب: تنفيذ ${requiredSlips} تفادياً قريباً إجمالياً` : `Reason: Execute ${requiredSlips} total near misses`;
        isUnlocked = stats.totalNearMisses >= requiredSlips;
      } else {
        const requiredSlips = i * 5;
        const requiredScore = Math.floor(i / 3) + 1;
        reason = isRtl
          ? `السبب: وصول النتيجة لـ ${requiredScore} نقطة مع ${requiredSlips} تفادياً`
          : `Reason: Reach ${requiredScore} points with ${requiredSlips} slips`;
        isUnlocked = highScore >= requiredScore && stats.totalNearMisses >= requiredSlips;
      }

      list.push({
        id: i,
        reason,
        unlocked: isUnlocked,
      });
    }
    return list;
  }, [highScore, stats.totalNearMisses, stats.gamesPlayed]);

  const unlockedCount = useMemo(() => mysteryBadges.filter(b => b.unlocked).length, [mysteryBadges]);

  const handleScrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const handleScrollToTop = () => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  };

  const renderBadgeItem = ({ item }: { item: MysteryBadge }) => {
    const title = `${I18nService.t('profile.secretBadge')} #${item.id}`;

    return (
      <View
        style={[
          styles.achCard,
          item.unlocked && styles.achCardUnlocked,
          { flexDirection: isRTL ? 'row-reverse' : 'row' },
        ]}
      >
        <View style={[styles.achIconBox, item.unlocked && styles.achIconBoxUnlocked]}>
          {item.unlocked ? (
            <Gem size={20} color="#FACC15" />
          ) : (
            <Lock size={18} color="#64748B" />
          )}
        </View>
        <View style={styles.achTextGroup}>
          <Text style={[styles.achTitle, item.unlocked && styles.achTitleUnlocked, { textAlign: isRTL ? 'right' : 'left' }]}>
            {title}
          </Text>
          <Text style={[styles.achDesc, item.unlocked && { color: '#FACC15' }, { textAlign: isRTL ? 'right' : 'left' }]}>
            {item.reason}
          </Text>
        </View>
        <Text style={[styles.badgeNumberText, item.unlocked && { color: '#FACC15' }]}>
          #{item.id}
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.headerContentContainer}>
      {/* Badges Counter Banner */}
      <View style={styles.bannerCard}>
        <Award size={32} color="#FACC15" />
        <Text style={styles.bannerTitle}>{I18nService.t('profile.badgesHeader')}</Text>
        <Text style={styles.counterSubtitle}>{unlockedCount} / 500 {I18nService.t('profile.unlockedBadges')}</Text>
      </View>

      {/* Quick Jump Controls */}
      <View style={[styles.quickJumpBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity
          style={styles.jumpButton}
          activeOpacity={0.8}
          onPress={handleScrollToBottom}
        >
          <ChevronDown size={16} color="#06B6D4" />
          <Text style={styles.jumpButtonText}>
            {isRTL ? 'القفز لأسفل القائمة (#500)' : 'Jump to Bottom (#500)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.jumpButton}
          activeOpacity={0.8}
          onPress={handleScrollToTop}
        >
          <ChevronUp size={16} color="#FACC15" />
          <Text style={[styles.jumpButtonText, { color: '#FACC15' }]}>
            {isRTL ? 'الأعلى' : 'Top'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFooter = () => (
    <TouchableOpacity
      style={[styles.doneButton, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
      activeOpacity={0.8}
      onPress={onClose}
    >
      <Home size={18} color="#FFFFFF" />
      <Text style={styles.doneText}>
        {I18nService.t('profile.returnHome')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ImageBackground source={SpriteAssets.menuBg} style={styles.backgroundImage} resizeMode="cover">
      <Animated.View style={[styles.fullScreenContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        {/* Top Navigation Bar */}
        <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.7} onPress={onClose}>
            {isRTL ? <ArrowRight size={20} color="#06B6D4" /> : <ArrowLeft size={20} color="#06B6D4" />}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{I18nService.t('profile.badgesHeader')}</Text>
          <TouchableOpacity style={styles.homeButton} activeOpacity={0.7} onPress={onClose}>
            <Home size={18} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Dedicated Single FlatList (Zero VirtualizedList Nesting Errors!) */}
        <FlatList
          ref={flatListRef}
          data={mysteryBadges}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderBadgeItem}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          indicatorStyle="white"
          initialNumToRender={15}
          maxToRenderPerBatch={20}
          windowSize={10}
        />
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
    paddingBottom: 16,
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
    paddingBottom: 40,
    gap: 10,
  },
  headerContentContainer: {
    gap: 12,
    marginBottom: 8,
  },
  bannerCard: {
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#FACC15',
    gap: 6,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  counterSubtitle: {
    color: '#FACC15',
    fontSize: 13,
    fontWeight: '800',
  },
  quickJumpBar: {
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  jumpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  jumpButtonText: {
    color: '#06B6D4',
    fontSize: 12,
    fontWeight: '800',
  },
  achCard: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#334155',
    opacity: 0.5,
  },
  achCardUnlocked: {
    borderColor: 'rgba(250, 204, 21, 0.6)',
    opacity: 1.0,
    backgroundColor: '#1E293B',
  },
  achIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
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
    fontSize: 13,
    fontWeight: '800',
  },
  achTitleUnlocked: {
    color: '#FACC15',
  },
  achDesc: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  badgeNumberText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '900',
  },
  doneButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 16,
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
});
