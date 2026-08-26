import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { X, Volume2, VolumeX, Smartphone, Globe, BarChart2 } from 'lucide-react-native';
import { I18nService } from '../../i18n';
import { StorageService } from '../../services/StorageService';
import { audioHaptics } from '../../services/AudioHapticsService';
import { LanguageSwitcher } from '../../components/LanguageSwitcher/LanguageSwitcher';

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const [, setLangTick] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(audioHaptics.isSoundEnabled());
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(audioHaptics.isHapticsEnabled());
  const stats = StorageService.getStatsSync();
  const isRTL = I18nService.isRTL();

  useEffect(() => {
    return I18nService.subscribe(() => {
      setLangTick((prev) => prev + 1);
    });
  }, []);

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
    <View style={styles.overlay}>
      <View style={styles.card}>
        {/* Header Row */}
        <View style={[styles.headerRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={styles.titleText}>{I18nService.t('settings.title')}</Text>
          <TouchableOpacity style={styles.closeButton} activeOpacity={0.7} onPress={onClose}>
            <X size={20} color="#94A3B8" />
          </TouchableOpacity>
        </View>

        {/* Setting Items */}
        <View style={styles.settingsSection}>
          {/* Language Item */}
          <View style={[styles.settingRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.labelGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Globe size={20} color="#06B6D4" />
              <Text style={styles.settingLabel}>{I18nService.t('settings.language')}</Text>
            </View>
            <LanguageSwitcher />
          </View>

          {/* Sound Toggle Item */}
          <View style={[styles.settingRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.labelGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {soundEnabled ? <Volume2 size={20} color="#EC4899" /> : <VolumeX size={20} color="#64748B" />}
              <Text style={styles.settingLabel}>{I18nService.t('settings.sound')}</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{ false: '#334155', true: '#EC4899' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Haptics Toggle Item */}
          <View style={[styles.settingRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.labelGroup, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Smartphone size={20} color="#FACC15" />
              <Text style={styles.settingLabel}>{I18nService.t('settings.haptics')}</Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleToggleHaptics}
              trackColor={{ false: '#334155', true: '#FACC15' }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* Stats Summary Section */}
        <View style={styles.statsSection}>
          <View style={[styles.statsHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <BarChart2 size={16} color="#38BDF8" />
            <Text style={styles.statsHeaderText}>{I18nService.t('menu.stats')}</Text>
          </View>

          <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.statLabel}>{I18nService.t('stats.gamesPlayed')}:</Text>
            <Text style={styles.statVal}>{stats.gamesPlayed}</Text>
          </View>

          <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.statLabel}>{I18nService.t('stats.totalNearMisses')}:</Text>
            <Text style={styles.statVal}>{stats.totalNearMisses}</Text>
          </View>

          <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={styles.statLabel}>{I18nService.t('stats.bestCombo')}:</Text>
            <Text style={styles.statVal}>{stats.bestCombo}x</Text>
          </View>
        </View>

        {/* Close Button */}
        <TouchableOpacity style={styles.doneButton} activeOpacity={0.8} onPress={onClose}>
          <Text style={styles.doneText}>{I18nService.t('settings.close')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    zIndex: 120,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#1E293B',
    borderRadius: 24,
    padding: 24,
    borderWidth: 2,
    borderColor: '#334155',
  },
  headerRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsSection: {
    gap: 16,
    marginBottom: 24,
  },
  settingRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  labelGroup: {
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  statsSection: {
    backgroundColor: '#0F172A',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  statsHeader: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  statsHeaderText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statsRow: {
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  statVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  doneButton: {
    backgroundColor: '#06B6D4',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
});
