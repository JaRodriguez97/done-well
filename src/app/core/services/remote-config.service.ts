import { Injectable, NgZone } from '@angular/core';
import { Platform } from '@ionic/angular/standalone';
import { BehaviorSubject, Observable } from 'rxjs';
import {
  REMOTE_CONFIG_DEFAULTS,
  REMOTE_CONFIG_KEYS,
} from '../constants/remote-config.constants';
import {
  CordovaWindow,
  FirebasexConfigPluginBridge,
} from '../models/remote-config.model';

@Injectable({
  providedIn: 'root',
})
export class RemoteConfigService {
  private readonly enableStatsSubject = new BehaviorSubject<boolean>(
    REMOTE_CONFIG_DEFAULTS[REMOTE_CONFIG_KEYS.ENABLE_STATS],
  );

  readonly enableStats$: Observable<boolean> =
    this.enableStatsSubject.asObservable();

  constructor(
    private readonly platform: Platform,
    private readonly ngZone: NgZone,
  ) {}

  get currentEnableStats(): boolean {
    return this.enableStatsSubject.value;
  }

  /**
   * Sincroniza los feature flags remotos y actualiza el flujo reactivo de la app.
   */
  async syncFlags(): Promise<boolean> {
    try {
      await this.platform.ready();
      const cordovaWindow = window as unknown as CordovaWindow;

      if (cordovaWindow.FirebasexConfig) {
        return await this.syncFromFirebasex(cordovaWindow.FirebasexConfig);
      }
    } catch {
      return this.enableStatsSubject.value;
    }

    return this.enableStatsSubject.value;
  }

  private async syncFromFirebasex(
    plugin: FirebasexConfigPluginBridge,
  ): Promise<boolean> {
    await this.callVoid((success, error) => plugin.fetch(0, success, error));
    await this.callResult<boolean>((success, error) =>
      plugin.activateFetched(success, error),
    );
    const rawValue = await this.callResult<unknown>((success, error) =>
      plugin.getValue(REMOTE_CONFIG_KEYS.ENABLE_STATS, success, error),
    );

    const resolved = this.parseBooleanFlag(
      rawValue,
      this.enableStatsSubject.value,
    );
    this.updateEnableStats(resolved);
    return resolved;
  }

  private updateEnableStats(value: boolean): void {
    this.ngZone.run(() => {
      if (this.enableStatsSubject.value !== value) {
        this.enableStatsSubject.next(value);
      }
    });
  }

  private parseBooleanFlag(rawValue: unknown, fallback: boolean): boolean {
    if (rawValue === true || rawValue === 'true' || rawValue === '1') {
      return true;
    }
    if (rawValue === false || rawValue === 'false' || rawValue === '0') {
      return false;
    }
    return fallback;
  }

  private callVoid(
    invoke: (success: () => void, error: (err: unknown) => void) => void,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      invoke(
        () => resolve(),
        (err) => reject(err),
      );
    });
  }

  private callResult<T>(
    invoke: (
      success: (result: T) => void,
      error: (err: unknown) => void,
    ) => void,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      invoke(
        (result) => resolve(result),
        (err) => reject(err),
      );
    });
  }
}
