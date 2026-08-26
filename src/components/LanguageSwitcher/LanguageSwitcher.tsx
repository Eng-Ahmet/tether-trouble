import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Globe } from 'lucide-react-native';
import { I18nService, LanguageCode } from '../../i18n';

export const LanguageSwitcher: React.FC = () => {
  const [lang, setLang] = useState<LanguageCode>(I18nService.getLanguage());

  useEffect(() => {
    return I18nService.subscribe(() => {
      setLang(I18nService.getLanguage());
    });
  }, []);

  const toggleLanguage = () => {
    const nextLang: LanguageCode = lang === 'ar' ? 'en' : 'ar';
    I18nService.setLanguage(nextLang);
  };

  return (
    <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={toggleLanguage}>
      <Globe size={18} color="#06B6D4" />
      <Text style={styles.text}>{lang === 'ar' ? 'العربية 🇸🇦' : 'English 🇺🇸'}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#06B6D4',
  },
  text: {
    color: '#06B6D4',
    fontSize: 13,
    fontWeight: '800',
  },
});
