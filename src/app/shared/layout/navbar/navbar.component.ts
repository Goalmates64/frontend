import {ChangeDetectionStrategy, Component, ElementRef, HostListener, ViewChild} from '@angular/core';
import {AuthService} from '../../../core/auth.service';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {NotificationsService} from '../../../core/notifications.service';
import {ToastService} from '../../../core/toast.service';
import {AppNotification} from '../../../core/models/notification.model';
import {take} from 'rxjs/operators';

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
  unreadNotifications$: Observable<AppNotification[]>;

  mobileMenuOpen = false;
  drawerOpen = false;
  @ViewChild('notificationsContainer') notificationsContainer?: ElementRef<HTMLDivElement>;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly notificationsService: NotificationsService,
    private readonly toast: ToastService,
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
    this.unreadCount$ = this.notificationsService.unreadCount$;
    this.unreadNotifications$ = this.notificationsService.unreadNotifications$;
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

  goToNotifications(): void {
    this.drawerOpen = false;
    void this.router.navigate(['/notifications']);
  }

  toggleDrawer(event: MouseEvent): void {
    event.stopPropagation();
    this.drawerOpen = !this.drawerOpen;
  }

  closeDrawer(): void {
    this.drawerOpen = false;
  }

  markNotificationAsRead(notification: AppNotification, event?: MouseEvent): void {
    event?.stopPropagation();
    if (notification.isRead) {
      return;
    }
    this.notificationsService
      .markAsRead(notification.id, true)
      .pipe(take(1))
      .subscribe({
        error: () => this.toast.error("Impossible d'actualiser la notification."),
      });
  }

  trackByNotification(_index: number, notification: AppNotification): number {
    return notification.id;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.drawerOpen) {
      return;
    }
    const target = event.target as Node;
    if (this.notificationsContainer?.nativeElement.contains(target)) {
      return;
    }
    this.drawerOpen = false;
  }
}
