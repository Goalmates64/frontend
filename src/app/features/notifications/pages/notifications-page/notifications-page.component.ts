import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { NotificationsService } from '../../../../core/notifications.service';
import { ToastService } from '../../../../core/toast.service';
import { AppNotification } from '../../../../core/models/notification.model';

@Component({
  selector: 'app-notifications-page',
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss',

  standalone: false,
})
export class NotificationsPageComponent implements OnDestroy {
  notifications: AppNotification[] = [];
  isLoading = false;
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly toast: ToastService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.subscriptions.add(
      this.notificationsService.notifications$.subscribe((notifications) => {
        this.notifications = notifications;
        this.cdr.markForCheck();
      }),
    );
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationsService.loadAll().subscribe({
      next: () => {
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
      next: () => {
        this.toast.success('Notification marquée comme lue.');
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
