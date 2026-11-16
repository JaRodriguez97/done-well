import {
  ComponentFixture,
  fakeAsync,
  flushMicrotasks,
  TestBed,
  tick,
} from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Platform } from '@ionic/angular/standalone';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    const platform = TestBed.inject(Platform);
    spyOn(platform, 'ready').and.resolveTo('dom');

    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
  });

  it('should render the animated splash with floating DW logo and DoneWell title initially', () => {
    fixture.detectChanges();

    const splashEl = fixture.nativeElement.querySelector('.dw-splash');
    const logoImg = fixture.nativeElement.querySelector(
      '.dw-splash__logo',
    ) as HTMLImageElement | null;
    const titleEl = fixture.nativeElement.querySelector('.dw-splash__title');

    expect(component).toBeTruthy();
    expect(component.isSplashVisible).toBeTrue();
    expect(splashEl).not.toBeNull();
    expect(logoImg?.getAttribute('src')).toBe('assets/icon/donewell-logo.png');
    expect(titleEl?.textContent?.trim()).toBe('DoneWell');
  });

  it('should fade out at 1500ms and hide splash screen after 2000ms', fakeAsync(() => {
    fixture.detectChanges();
    flushMicrotasks();

    expect(component.isSplashVisible).toBeTrue();
    expect(component.isSplashFadingOut).toBeFalse();

    tick(1500);
    fixture.detectChanges();
    expect(component.isSplashFadingOut).toBeTrue();
    expect(component.isSplashVisible).toBeTrue();

    tick(500);
    fixture.detectChanges();
    expect(component.isSplashVisible).toBeFalse();
    expect(fixture.nativeElement.querySelector('.dw-splash')).toBeNull();
  }));
});
