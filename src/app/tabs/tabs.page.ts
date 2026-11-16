import { AsyncPipe } from '@angular/common';
import {
  Component,
  EnvironmentInjector,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
  Platform,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkboxOutline,
  pricetagsOutline,
  statsChartOutline,
} from 'ionicons/icons';
import { Subscription } from 'rxjs';
import { RemoteConfigService } from '../core/services/remote-config.service';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: true,
  imports: [
    AsyncPipe,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
  ],
})
export class TabsPage implements OnInit, OnDestroy {
  public environmentInjector = inject(EnvironmentInjector);
  readonly enableStats$ = this.remoteConfigService.enableStats$;

  private isStatsEnabled = true;
  private touchStartX = 0;
  private touchStartY = 0;
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly remoteConfigService: RemoteConfigService,
    private readonly platform: Platform,
    private readonly router: Router,
  ) {
    addIcons({ checkboxOutline, pricetagsOutline, statsChartOutline });
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.enableStats$.subscribe((enabled) => {
        this.isStatsEnabled = enabled;
        if (!enabled && this.router.url.includes('/tabs/tab3')) {
          void this.router.navigateByUrl('/tabs/tab1');
        }
      }),
    );

    this.subscriptions.add(
      this.platform.resume.subscribe(() => {
        void this.remoteConfigService.syncFlags();
      }),
    );

    void this.remoteConfigService.syncFlags();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private isSwipeIgnored(target: HTMLElement | null): boolean {
    return !!target?.closest(
      'app-task-category-filter, .task-filter, .task-filter__chips, ion-modal, ion-searchbar, input, textarea',
    );
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    const target = event.target as HTMLElement | null;
    if (this.isSwipeIgnored(target)) {
      this.touchStartX = 0;
      this.touchStartY = 0;
      return;
    }

    const touch = event.touches[0];
    if (touch) {
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (this.touchStartX === 0 && this.touchStartY === 0) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (this.isSwipeIgnored(target)) {
      this.touchStartX = 0;
      this.touchStartY = 0;
      return;
    }

    const touch = event.changedTouches[0];
    if (!touch) {
      return;
    }

    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    this.touchStartX = 0;
    this.touchStartY = 0;

    if (Math.abs(deltaX) >= 55 && Math.abs(deltaX) > Math.abs(deltaY) * 1.35) {
      if (deltaX < 0) {
        this.onSwipeNext();
      } else {
        this.onSwipePrev();
      }
    }
  }

  private onSwipeNext(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/tabs/tab1') || currentUrl === '/tabs') {
      void this.router.navigateByUrl('/tabs/tab2');
    } else if (currentUrl.includes('/tabs/tab2') && this.isStatsEnabled) {
      void this.router.navigateByUrl('/tabs/tab3');
    }
  }

  private onSwipePrev(): void {
    const currentUrl = this.router.url;
    if (currentUrl.includes('/tabs/tab3')) {
      void this.router.navigateByUrl('/tabs/tab2');
    } else if (currentUrl.includes('/tabs/tab2')) {
      void this.router.navigateByUrl('/tabs/tab1');
    }
  }
}
