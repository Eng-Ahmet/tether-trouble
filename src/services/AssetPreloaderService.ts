import { Asset } from 'expo-asset';
import { SpriteAssetList } from '../assets/spriteAssets';
import { I18nService } from '../i18n/I18nService';
import { StorageService } from './StorageService';

export type ProgressCallback = (progress: number, status: string) => void;

export class AssetPreloaderService {
  private static isReady: boolean = false;
  private static initializationPromise: Promise<void> | null = null;

  public static isLoaded(): boolean {
    return this.isReady;
  }

  public static initialize(onProgress?: ProgressCallback): Promise<void> {
    if (this.isReady) {
      if (onProgress) onProgress(1.0, I18nService.t('splash.almostReady'));
      return Promise.resolve();
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      try {
        if (onProgress) onProgress(0.05, I18nService.t('splash.preparing'));

        // Step 1: Initialize i18n & storage (0% - 20%)
        await Promise.all([I18nService.init(), StorageService.preload()]);
        if (onProgress) onProgress(0.20, I18nService.t('splash.preparing'));

        // Step 2: Critical Asset Loading (20% - 90%)
        const totalAssets = SpriteAssetList.length;
        let completedCount = 0;

        if (totalAssets > 0) {
          await Promise.all(
            SpriteAssetList.map(async (assetRef) => {
              try {
                await Asset.loadAsync(assetRef);
              } catch (error) {
                console.warn('[AssetPreloader] Non-fatal error preloading asset:', assetRef, error);
              } finally {
                completedCount++;
                const progress = 0.20 + (completedCount / totalAssets) * 0.70;
                if (onProgress) {
                  onProgress(progress, I18nService.t('splash.loading'));
                }
              }
            })
          );
        } else {
          if (onProgress) onProgress(0.90, I18nService.t('splash.loading'));
        }

        // Step 3: Finalization (90% - 100%)
        this.isReady = true;
        if (onProgress) onProgress(1.0, I18nService.t('splash.almostReady'));
      } catch (error) {
        console.error('[AssetPreloader] Critical error during initialization:', error);
        this.isReady = true;
        if (onProgress) onProgress(1.0, I18nService.t('splash.almostReady'));
      } finally {
        this.initializationPromise = null;
      }
    })();

    return this.initializationPromise;
  }
}
