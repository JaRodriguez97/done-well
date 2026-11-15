import { AsyncPipe } from '@angular/common';
import {
  Component,
  EnvironmentInjector,
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
}
