import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  IonApp,
  IonRouterOutlet,
  IonText,
  Platform,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet, IonText],
})
export class AppComponent implements OnInit, OnDestroy {
  private static readonly SPLASH_VISIBLE_MS = 1500;
  private static readonly SPLASH_TOTAL_MS = 2000;

  isSplashVisible = true;
  isSplashFadingOut = false;

  private isDestroyed = false;
  private fadeTimer: ReturnType<typeof setTimeout> | null = null;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly platform: Platform) {}

  ngOnInit(): void {
    void this.startSplashSequence();
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    if (this.fadeTimer) {
      clearTimeout(this.fadeTimer);
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
    }
  }

  private async startSplashSequence(): Promise<void> {
    await this.platform.ready();
    if (this.isDestroyed) {
      return;
    }

    this.fadeTimer = setTimeout(() => {
      this.isSplashFadingOut = true;
    }, AppComponent.SPLASH_VISIBLE_MS);

    this.hideTimer = setTimeout(() => {
      this.isSplashVisible = false;
    }, AppComponent.SPLASH_TOTAL_MS);
  }
}
