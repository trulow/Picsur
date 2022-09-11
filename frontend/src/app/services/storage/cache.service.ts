import { Inject, Injectable } from '@angular/core';
import { SESSION_STORAGE } from '@ng-web-apis/common';
import { AsyncFailable, Failable, HasFailed } from 'picsur-shared/dist/types';

interface dataWrapper<T> {
  data: T;
  expires: number;
}

@Injectable({
  providedIn: 'root',
})
export class CacheService {
  private readonly cacheExpiresMS = 1000 * 60 * 60;
  private cacheVersion = '0.0.0';

  constructor(@Inject(SESSION_STORAGE) private readonly storage: Storage) {}

  public setVersion(version: string): void {
    if (version !== this.cacheVersion) this.clear();

    this.cacheVersion = version;
  }

  public clear(): void {
    this.storage.clear();
  }

  public set<T>(key: string, value: T): void {
    const safeKey = this.transformKey(key);

    const data: dataWrapper<T> = {
      data: value,
      expires: Date.now() + this.cacheExpiresMS,
    };

    this.storage.setItem(safeKey, JSON.stringify(data));
  }

  public get<T>(key: string): T | null {
    const safeKey = this.transformKey(key);

    try {
      const data: dataWrapper<T> = JSON.parse(this.storage.getItem(safeKey) ?? '');
      if (data && data.data && data.expires > Date.now()) {
        return data.data;
      }
      return null;
    } catch (e) {
      return null;
    }
  }

  public async getFallback<T>(
    key: string,
    finalFallback: T,
    ...fallbacks: Array<(key: string) => AsyncFailable<T> | Failable<T>>
  ): Promise<T> {
    const safeKey = this.transformKey(key);

    const cached = this.get<T>(safeKey);
    if (cached !== null) {
      return cached;
    }

    for (const fallback of fallbacks) {
      const result = await fallback(safeKey);
      if (HasFailed(result)) {
        continue;
      }

      this.set(safeKey, result);
      return result;
    }

    return finalFallback;
  }

  private transformKey(key: string): string {
    return `${this.cacheVersion}-${key}`;
  }
}
