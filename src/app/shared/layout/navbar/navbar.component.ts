import {ChangeDetectionStrategy, Component} from '@angular/core';
import {AuthService} from '../../../core/auth.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {NotificationsService} from '../../../core/notifications.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
  isAuthenticated$: Observable<boolean>;
  currentUser$;
  unreadCount$: Observable<number>;

  mobileMenuOpen = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly notificationsService: NotificationsService,
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
    this.unreadCount$ = this.notificationsService.unreadCount$;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }

  async onLogoutClick(): Promise<void> {
    this.authService.logout();
    this.closeMobileMenu();
    await this.router.navigate(['/']);
  }
}
