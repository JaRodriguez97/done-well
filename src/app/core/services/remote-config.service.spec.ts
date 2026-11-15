import { TestBed } from '@angular/core/testing';
import { Platform } from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { REMOTE_CONFIG_KEYS } from '../constants/remote-config.constants';
import { FirebasexConfigPluginBridge } from '../models/remote-config.model';
import { RemoteConfigService } from './remote-config.service';

interface TestCordovaWindow extends Window {
  FirebasexConfig?: FirebasexConfigPluginBridge;
}

describe('RemoteConfigService', () => {
  let service: RemoteConfigService;
  let platformSpy: jasmine.SpyObj<Platform>;
  const testWindow = window as TestCordovaWindow;

  beforeEach(() => {
    delete testWindow.FirebasexConfig;
    platformSpy = jasmine.createSpyObj<Platform>('Platform', ['ready']);
    platformSpy.ready.and.resolveTo('dom');

    TestBed.configureTestingModule({
      providers: [
        RemoteConfigService,
        { provide: Platform, useValue: platformSpy },
      ],
    });

    service = TestBed.inject(RemoteConfigService);
  });

  afterEach(() => {
    delete testWindow.FirebasexConfig;
  });

  it('should expose default true value for enable_stats when native plugin is unavailable', async () => {
    const synced = await service.syncFlags();
    const emitted = await firstValueFrom(service.enableStats$);

    expect(platformSpy.ready).toHaveBeenCalledTimes(1);
    expect(synced).toBeTrue();
    expect(emitted).toBeTrue();
  });

  it('should fetch, activate and update enableStats$ from FirebasexConfig plugin', async () => {
    let remoteFlag = 'false';

    testWindow.FirebasexConfig = {
      fetch: (_seconds, success) => success(),
      activateFetched: (success) => success(true),
      getValue: (key, success) => {
        expect(key).toBe(REMOTE_CONFIG_KEYS.ENABLE_STATS);
        success(remoteFlag);
      },
    };

    const firstSync = await service.syncFlags();
    expect(firstSync).toBeFalse();
    expect(await firstValueFrom(service.enableStats$)).toBeFalse();

    remoteFlag = 'true';
    const secondSync = await service.syncFlags();
    expect(secondSync).toBeTrue();
    expect(await firstValueFrom(service.enableStats$)).toBeTrue();
  });

  it('should keep current flag cleanly if FirebasexConfig fetch fails', async () => {
    testWindow.FirebasexConfig = {
      fetch: (_seconds, _success, error) => error('Network unavailable'),
      activateFetched: (success) => success(false),
      getValue: (_key, success) => success('false'),
    };

    const synced = await service.syncFlags();

    expect(synced).toBeTrue();
    expect(await firstValueFrom(service.enableStats$)).toBeTrue();
  });
});
