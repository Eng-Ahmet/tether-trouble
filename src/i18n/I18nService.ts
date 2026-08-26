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

  public setLanguage(lang: LanguageCode): void {
    if (this.currentLang === lang) return;
    this.currentLang = lang;
    this.notifySubscribers();
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang).catch((e) => {
      console.log('Error saving language:', e);
    });
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

  public getCauseQuote(causeType: string): string {
    const causeQuotes = this.dictionaries[this.currentLang]?.causeQuotes || enDict.causeQuotes;
    if (causeQuotes && causeQuotes[causeType]) {
      const val = causeQuotes[causeType];
      if (Array.isArray(val)) {
        return val[Math.floor(Math.random() * val.length)];
      }
      if (typeof val === 'string') {
        return val;
      }
    }
    return this.getRandomQuote();
  }

  public getSmartTip(): string {
    const titles = this.dictionaries[this.currentLang]?.developerTitles || enDict.developerTitles;
    const tips = this.dictionaries[this.currentLang]?.smartTips || enDict.smartTips;

    const title = titles && Array.isArray(titles) ? titles[Math.floor(Math.random() * titles.length)] : 'مفكر حالم ذكي';
    const tip = tips && Array.isArray(tips) ? tips[Math.floor(Math.random() * tips.length)] : this.t('gameOver.tip');

    return `${title}: ${tip}`;
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
