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

    try {
      // 1. Load i18n localization
      if (onProgress) onProgress(0.15, 'Loading Localization...');
      await I18nService.init();

      // 2. Preload Storage
      if (onProgress) onProgress(0.3, I18nService.t('splash.preparing'));
      await StorageService.preload();

      // 3. Preload all PNG sprite assets with real step progress
      const totalAssets = SpriteAssetList.length;
      let loadedCount = 0;

      for (const assetRef of SpriteAssetList) {
        await Asset.loadAsync(assetRef);
        loadedCount += 1;
        const assetProgress = 0.3 + (loadedCount / totalAssets) * 0.65;
        const statusText = I18nService.t('splash.loading');
        if (onProgress) onProgress(assetProgress, statusText);
      }

      this.isReady = true;
      if (onProgress) onProgress(1.0, I18nService.t('splash.almostReady'));
    } catch (error) {
      console.log('AssetPreloaderService initialization error:', error);
      // Fallback mark as ready so app does not get stuck
      this.isReady = true;
      if (onProgress) onProgress(1.0, 'Ready');
    }
  }
}
