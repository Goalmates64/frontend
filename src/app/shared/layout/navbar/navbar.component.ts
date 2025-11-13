import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationsService } from '../../../core/notifications.service';
import { ToastService } from '../../../core/toast.service';
import { AppNotification } from '../../../core/models/notification.model';
import { take } from 'rxjs/operators';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  isAuthenticated$: Observable<boolean>;
  currentUser$;
  unreadCount$: Observable<number>;
  unreadNotifications$: Observable<AppNotification[]>;

  mobileMenuOpen = false;
  drawerOpen = false;
  profileDrawerOpen = false;
  @ViewChild('notificationsContainer')
  notificationsContainer?: ElementRef<HTMLDivElement>;
  @ViewChild('profileContainer') profileContainer?: ElementRef<HTMLDivElement>;

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
    this.closeNotificationsDrawer();
    this.closeProfileDrawer();
    await this.router.navigate(['/']);
  }

  goToNotifications(): void {
    this.drawerOpen = false;
    this.profileDrawerOpen = false;
    void this.router.navigate(['/notifications']);
  }

  toggleNotificationsDrawer(event: MouseEvent): void {
    event.stopPropagation();
    this.drawerOpen = !this.drawerOpen;
  }

  closeNotificationsDrawer(): void {
    this.drawerOpen = false;
  }

  markNotificationAsRead(
    notification: AppNotification,
    event?: MouseEvent,
  ): void {
    event?.stopPropagation();
    if (notification.isRead) {
      return;
    }
    this.notificationsService
      .markAsRead(notification.id, true)
      .pipe(take(1))
      .subscribe({
        error: () =>
          this.toast.error("Impossible d'actualiser la notification."),
      });
  }

  trackByNotification(_index: number, notification: AppNotification): number {
    return notification.id;
  }

  avatarInitial(user: User | null | undefined): string {
    const source = user?.username || user?.email || '?';
    return source.charAt(0).toUpperCase();
  }

  toggleProfileDrawer(event: MouseEvent): void {
    event.stopPropagation();
    this.profileDrawerOpen = !this.profileDrawerOpen;
  }

  closeProfileDrawer(): void {
    this.profileDrawerOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node;
    if (this.drawerOpen) {
      if (!this.notificationsContainer?.nativeElement.contains(target)) {
        this.drawerOpen = false;
      }
    }
    if (this.profileDrawerOpen) {
      if (!this.profileContainer?.nativeElement.contains(target)) {
        this.profileDrawerOpen = false;
      }
    }
  }
}
