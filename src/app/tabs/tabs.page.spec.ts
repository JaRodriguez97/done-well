import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Platform } from '@ionic/angular/standalone';
import { BehaviorSubject } from 'rxjs';
import { RemoteConfigService } from '../core/services/remote-config.service';
import { TabsPage } from './tabs.page';

describe('TabsPage', () => {
  let component: TabsPage;
  let fixture: ComponentFixture<TabsPage>;
  let enableStatsSubject: BehaviorSubject<boolean>;
  let remoteConfigSpy: jasmine.SpyObj<RemoteConfigService>;
  let platform: Platform;
  let router: Router;

  beforeEach(async () => {
    enableStatsSubject = new BehaviorSubject<boolean>(true);

    remoteConfigSpy = jasmine.createSpyObj<RemoteConfigService>(
      'RemoteConfigService',
      ['syncFlags'],
      { enableStats$: enableStatsSubject.asObservable() },
    );
    remoteConfigSpy.syncFlags.and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [TabsPage],
      providers: [
        provideRouter([]),
        { provide: RemoteConfigService, useValue: remoteConfigSpy },
      ],
    }).compileComponents();

    platform = TestBed.inject(Platform);
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(TabsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create, sync flags on init and on platform resume', () => {
    expect(component).toBeTruthy();
    expect(remoteConfigSpy.syncFlags).toHaveBeenCalledTimes(1);

    platform.resume.next();
    expect(remoteConfigSpy.syncFlags).toHaveBeenCalledTimes(2);
  });

  it('should render stats tab button only when enableStats$ is true', () => {
    const getStatsButton = () =>
      fixture.nativeElement.querySelector('ion-tab-button[tab="tab3"]');

    expect(getStatsButton()).not.toBeNull();

    enableStatsSubject.next(false);
    fixture.detectChanges();
    expect(getStatsButton()).toBeNull();

    enableStatsSubject.next(true);
    fixture.detectChanges();
    expect(getStatsButton()).not.toBeNull();
  });

  it('should redirect away from tab3 when enableStats$ switches to false', () => {
    spyOnProperty(router, 'url', 'get').and.returnValue('/tabs/tab3');
    const navigateSpy = spyOn(router, 'navigateByUrl').and.resolveTo(true);

    enableStatsSubject.next(false);

    expect(navigateSpy).toHaveBeenCalledOnceWith('/tabs/tab1');
  });
});
