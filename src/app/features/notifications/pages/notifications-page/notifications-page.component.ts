import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';

import {NotificationsService} from '../../../../core/notifications.service';
import {ToastService} from '../../../../core/toast.service';
import {AppNotification} from '../../../../core/models/notification.model';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class NotificationsPageComponent {
  notifications: AppNotification[] = [];
  isLoading = false;

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationsService.loadAll().subscribe({
      next: (notifications) => {
        this.notifications = notifications;
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error('Impossible de charger les notifications.');
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  markAsRead(notification: AppNotification): void {
    if (notification.isRead) {
      return;
    }

    this.notificationsService.markAsRead(notification.id, true).subscribe({
      next: (updated) => {
        this.notifications = this.notifications.map((entry) =>
          entry.id === updated.id ? updated : entry,
        );
        this.toast.success('Notification marquée comme lue.');
        this.cdr.markForCheck();
      },
      error: () => {
        this.toast.error("Impossible d'actualiser cette notification.");
        this.cdr.markForCheck();
      },
    });
  }

  trackByNotification(_index: number, notification: AppNotification): number {
    return notification.id;
  }
}
