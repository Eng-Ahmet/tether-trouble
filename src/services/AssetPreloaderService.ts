import { Asset } from 'expo-asset';
import { SpriteAssetList } from '../assets/spriteAssets';
import { I18nService } from '../i18n/I18nService';
import { StorageService } from './StorageService';

export type ProgressCallback = (progress: number, status: string) => void;

export class AssetPreloaderService {
  private static isReady: boolean = false;

  public static isLoaded(): boolean {
    return this.isReady;
  }

  public static async initialize(onProgress?: ProgressCallback): Promise<void> {
    if (this.isReady) {
      if (onProgress) onProgress(1.0, I18nService.t('splash.almostReady'));
      return;
    }

    // Safety fallback timer: guarantee preloader completes in max 1.5s in standalone APK
    const fallbackTimer = setTimeout(() => {
      if (!this.isReady) {
        this.isReady = true;
        if (onProgress) onProgress(1.0, I18nService.t('splash.almostReady'));
      }
    }, 1500);

    try {
      // 1. Instant i18n & Storage preload
      if (onProgress) onProgress(0.2, I18nService.t('splash.preparing'));
      await Promise.all([I18nService.init(), StorageService.preload()]);

      if (onProgress) onProgress(0.5, I18nService.t('splash.loading'));

      // 2. Non-blocking image asset preloading
      await Promise.all(
        SpriteAssetList.map((assetRef) =>
          Asset.loadAsync(assetRef).catch(() => {})
        )
      );

      clearTimeout(fallbackTimer);
      this.isReady = true;
      if (onProgress) onProgress(1.0, I18nService.t('splash.almostReady'));
    } catch (error) {
      console.log('AssetPreloaderService initialization error:', error);
      clearTimeout(fallbackTimer);
      this.isReady = true;
      if (onProgress) onProgress(1.0, 'Ready');
    }
  }
}
