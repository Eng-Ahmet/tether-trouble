import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { I18nService, LanguageCode } from '../../i18n';
import { audioHaptics } from '../../services/AudioHapticsService';

export const LanguageSwitcher: React.FC = () => {
  const [lang, setLang] = useState<LanguageCode>(I18nService.getLanguage());

  useEffect(() => {
    return I18nService.subscribe(() => {
      setLang(I18nService.getLanguage());
    });
  }, []);

  const selectLanguage = (targetLang: LanguageCode) => {
    if (lang !== targetLang) {
      audioHaptics.triggerLightHaptic();
      I18nService.setLanguage(targetLang);
    }
  };

  return (
    <View style={styles.container}>
      {/* Arabic Pill */}
      <TouchableOpacity
        style={[styles.pill, lang === 'ar' && styles.pillActive]}
        activeOpacity={0.8}
        onPress={() => selectLanguage('ar')}
      >
        <Text style={styles.flagText}>🇸🇦</Text>
        <Text style={[styles.labelText, lang === 'ar' && styles.labelActive]}>AR</Text>
      </TouchableOpacity>

      {/* English Pill */}
      <TouchableOpacity
        style={[styles.pill, lang === 'en' && styles.pillActive]}
        activeOpacity={0.8}
        onPress={() => selectLanguage('en')}
      >
        <Text style={styles.flagText}>🇺🇸</Text>
        <Text style={[styles.labelText, lang === 'en' && styles.labelActive]}>EN</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 24,
    padding: 3,
    borderWidth: 1.5,
    borderColor: '#334155',
    gap: 4,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  pillActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#06B6D4',
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  flagText: {
    fontSize: 18,
  },
  labelText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: '#06B6D4',
  },
});
