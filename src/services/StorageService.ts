import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameSettings } from '../types/game';

const HIGH_SCORE_KEY = '@tether_trouble_high_score';
const SETTINGS_KEY = '@tether_trouble_settings';
const STATS_KEY = '@tether_trouble_stats';

export interface GameStats {
  gamesPlayed: number;
  totalNearMisses: number;
  bestCombo: number;
}

export class StorageService {
  private static cachedHighScore: number = 0;
  private static cachedSettings: GameSettings = {
    soundEnabled: true,
    hapticsEnabled: true,
    reducedMotion: false,
  };
  private static cachedStats: GameStats = {
    gamesPlayed: 0,
    totalNearMisses: 0,
    bestCombo: 0,
  };
  private static isInitialized: boolean = false;

  /**
   * Preload all data into memory synchronously accessible cache on app startup
   */
  public static async preload(): Promise<void> {
    if (this.isInitialized) return;
    try {
      const [highScoreVal, settingsVal, statsVal] = await Promise.all([
        AsyncStorage.getItem(HIGH_SCORE_KEY),
        AsyncStorage.getItem(SETTINGS_KEY),
        AsyncStorage.getItem(STATS_KEY),
      ]);

      if (highScoreVal) this.cachedHighScore = parseInt(highScoreVal, 10) || 0;
      if (settingsVal) this.cachedSettings = { ...this.cachedSettings, ...JSON.parse(settingsVal) };
      if (statsVal) this.cachedStats = { ...this.cachedStats, ...JSON.parse(statsVal) };
    } catch (e) {
      console.log('Error preloading StorageService:', e);
    } finally {
      this.isInitialized = true;
    }
  }

  // --- Synchronous Zero-Await Accessors ---
  public static getHighScoreSync(): number {
    return this.cachedHighScore;
  }

  public static getSettingsSync(): GameSettings {
    return this.cachedSettings;
  }

  public static getStatsSync(): GameStats {
    return this.cachedStats;
  }

  // --- Background Non-Blocking Persistence ---
  public static saveHighScore(score: number): boolean {
    if (score > this.cachedHighScore) {
      this.cachedHighScore = score;
      // Fire-and-forget background save
      AsyncStorage.setItem(HIGH_SCORE_KEY, score.toString()).catch(() => {});
      return true;
    }
    return false;
  }

  public static saveSettings(settings: Partial<GameSettings>): void {
    this.cachedSettings = { ...this.cachedSettings, ...settings };
    // Fire-and-forget background save
    AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(this.cachedSettings)).catch(() => {});
  }

  public static updateStats(nearMisses: number, combo: number): GameStats {
    this.cachedStats = {
      gamesPlayed: this.cachedStats.gamesPlayed + 1,
      totalNearMisses: this.cachedStats.totalNearMisses + nearMisses,
      bestCombo: Math.max(this.cachedStats.bestCombo, combo),
    };
    // Fire-and-forget background save
    AsyncStorage.setItem(STATS_KEY, JSON.stringify(this.cachedStats)).catch(() => {});
    return this.cachedStats;
  }

  // Legacy Async Compatibility Methods
  public static async getHighScore(): Promise<number> {
    await this.preload();
    return this.cachedHighScore;
  }

  public static async getSettings(): Promise<GameSettings> {
    await this.preload();
    return this.cachedSettings;
  }

  public static async getStats(): Promise<GameStats> {
    await this.preload();
    return this.cachedStats;
  }
}
