import { CommonModule } from '@angular/common';
import { MediaMatcher } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ChangeDetectionStrategy,
  DestroyRef,
  Component,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import {
  Router,
  RouterModule,
  ActivatedRoute,
  ChildrenOutletContexts,
} from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';

import { CdkScrollable, ScrollingModule } from '@angular/cdk/scrolling';
import { OverlayModule } from '@angular/cdk/overlay';

import {
  AlertService,
  LoadingService,
  overlayAnimation,
  ToastService,
} from '../../../../shared';

import { routeAnimations } from '../../../../shared/animations/route-animations';
import { AuthService } from '../../../../auth/presentation/services/auth.service';
import { SocketService } from '../../services';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ProfileComponent, SidenavMenuComponent } from '../../components';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    MatIconModule,
    MatToolbarModule,
    MatSidenavModule,
    RouterModule,
    OverlayModule,
    MatButtonModule,
    ScrollingModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    ProfileComponent,
    SidenavMenuComponent,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [routeAnimations, overlayAnimation],
})
export default class HomeComponent {
  private socketService = inject(SocketService);
  private alertservice = inject(AlertService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  readonly dialogRef = inject(MatDialog);
  isLoading = inject(LoadingService).isLoading;

  public isProfileOpen = false;

  contexts = inject(ChildrenOutletContexts);

  @ViewChild(CdkScrollable) matContent!: CdkScrollable;

  protected isMobile = signal(true);
  private _mobileQuery: MediaQueryList;
  private _mobileQueryListener: () => void;

  constructor(protected route: ActivatedRoute) {
    const media = inject(MediaMatcher);

    this._mobileQuery = media.matchMedia('(max-width: 600px)');
    this.isMobile.set(this._mobileQuery.matches);
    this._mobileQueryListener = () =>
      this.isMobile.set(this._mobileQuery.matches);
    this._mobileQuery.addEventListener('change', this._mobileQueryListener);

    this.socketService.connect();

    this.destroyRef.onDestroy(() => {
      this.socketService.disconnect();
      this._mobileQuery.removeEventListener(
        'change',
        this._mobileQueryListener
      );
    });
  }

  ngOnInit(): void {
    this.listenUserConnections();
  }

  logout() {
    this.socketService.disconnect();
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  prepareRoute() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.[
      'animation'
    ];
  }

  get menu() {
    return this.authService.menu();
  }

  private listenUserConnections(): void {
    this.socketService.listenUserConnections();
  }
}
