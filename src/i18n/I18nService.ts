import AsyncStorage from '@react-native-async-storage/async-storage';
import arDict from './ar.json';
import enDict from './en.json';

export type LanguageCode = 'ar' | 'en';
type Listener = () => void;

const LANGUAGE_STORAGE_KEY = '@tether_trouble_lang';

class I18nManagerService {
  private currentLang: LanguageCode = 'ar'; // Default Arabic
  private dictionaries: Record<LanguageCode, any> = {
    ar: arDict,
    en: enDict,
  };
  private listeners: Set<Listener> = new Set();
  private isInitialized: boolean = false;

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const savedLang = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLang === 'en' || savedLang === 'ar') {
        this.currentLang = savedLang;
      }
    } catch (e) {
      console.log('Error loading language preference:', e);
    } finally {
      this.isInitialized = true;
    }
  }

  public getLanguage(): LanguageCode {
    return this.currentLang;
  }

  public async setLanguage(lang: LanguageCode): Promise<void> {
    if (this.currentLang === lang) return;
    this.currentLang = lang;
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    } catch (e) {}
    this.notifySubscribers();
  }

  public isRTL(): boolean {
    return this.currentLang === 'ar';
  }

  public t(keyPath: string): string {
    const keys = keyPath.split('.');
    let dict = this.dictionaries[this.currentLang];
    for (const key of keys) {
      if (dict && dict[key] !== undefined) {
        dict = dict[key];
      } else {
        // Fallback to English if missing in current dictionary
        let fallbackDict = this.dictionaries.en;
        for (const fKey of keys) {
          if (fallbackDict && fallbackDict[fKey] !== undefined) {
            fallbackDict = fallbackDict[fKey];
          } else {
            return keyPath; // Return raw key if missing everywhere
          }
        }
        return typeof fallbackDict === 'string' ? fallbackDict : keyPath;
      }
    }
    return typeof dict === 'string' ? dict : keyPath;
  }

  public getRandomQuote(): string {
    const quotes = this.dictionaries[this.currentLang]?.quotes || enDict.quotes;
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifySubscribers() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (e) {}
    });
  }
}

export const I18nService = new I18nManagerService();
