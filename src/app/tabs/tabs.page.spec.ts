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

  it('should navigate to next tab on swipe left and previous tab on swipe right', () => {
    const navigateSpy = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    let currentUrl = '/tabs/tab1';
    spyOnProperty(router, 'url', 'get').and.callFake(() => currentUrl);

    // Swipe left from tab1 -> tab2
    component.onTouchStart({
      touches: [{ clientX: 200, clientY: 100 } as Touch],
    } as unknown as TouchEvent);
    component.onTouchEnd({
      changedTouches: [{ clientX: 100, clientY: 105 } as Touch],
      target: document.createElement('div'),
    } as unknown as TouchEvent);
    expect(navigateSpy).toHaveBeenCalledWith('/tabs/tab2');

    // Swipe left from tab2 -> tab3
    currentUrl = '/tabs/tab2';
    component.onTouchStart({
      touches: [{ clientX: 200, clientY: 100 } as Touch],
    } as unknown as TouchEvent);
    component.onTouchEnd({
      changedTouches: [{ clientX: 100, clientY: 105 } as Touch],
      target: document.createElement('div'),
    } as unknown as TouchEvent);
    expect(navigateSpy).toHaveBeenCalledWith('/tabs/tab3');

    // Swipe right from tab3 -> tab2
    currentUrl = '/tabs/tab3';
    component.onTouchStart({
      touches: [{ clientX: 100, clientY: 100 } as Touch],
    } as unknown as TouchEvent);
    component.onTouchEnd({
      changedTouches: [{ clientX: 200, clientY: 105 } as Touch],
      target: document.createElement('div'),
    } as unknown as TouchEvent);
    expect(navigateSpy).toHaveBeenCalledWith('/tabs/tab2');
  });

  it('should ignore swipes initiated within category filter, modal or searchbar', () => {
    const navigateSpy = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    spyOnProperty(router, 'url', 'get').and.returnValue('/tabs/tab1');

    const filterHost = document.createElement('app-task-category-filter');
    const chip = document.createElement('ion-chip');
    filterHost.appendChild(chip);

    component.onTouchStart({
      touches: [{ clientX: 300, clientY: 100 } as Touch],
      target: chip,
    } as unknown as TouchEvent);

    component.onTouchEnd({
      changedTouches: [{ clientX: 100, clientY: 100 } as Touch],
      target: chip,
    } as unknown as TouchEvent);

    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
