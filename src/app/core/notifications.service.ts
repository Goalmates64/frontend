import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, take } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { io, Socket } from 'socket.io-client';

import { environment } from '../../environments/environment';
import { AppNotification } from './models/notification.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly baseUrl = `${environment.apiUrl}/notifications`;
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this.unreadCountSubject.asObservable();
  private readonly notificationsSubject = new BehaviorSubject<
    AppNotification[]
  >([]);
  readonly notifications$ = this.notificationsSubject.asObservable();

  readonly unreadNotifications$ = this.notifications$.pipe(
    map((notifications) =>
      notifications.filter((notification) => !notification.isRead),
    ),
  );

  private cachedNotifications: AppNotification[] = [];
  private socket: Socket | null = null;
  private readonly wsNamespaceUrl = this.buildWsNamespaceUrl();

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.fetchUnreadCount()
          .pipe(take(1))
          .subscribe({
            error: () => this.unreadCountSubject.next(0),
          });

        const token = this.authService.token;
        if (token) {
          this.connectSocket(token);
        }
      } else {
        this.disconnectSocket();
        this.resetState();
      }
    });
  }

  loadAll(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.baseUrl).pipe(
      tap((notifications) => {
        this.cachedNotifications = notifications;
        this.notificationsSubject.next([...this.cachedNotifications]);
        this.updateUnreadCountFromCache();
      }),
    );
  }

  markAsRead(
    notificationId: number,
    isRead: boolean,
  ): Observable<AppNotification> {
    return this.http
      .patch<AppNotification>(`${this.baseUrl}/${notificationId}/read`, {
        isRead,
      })
      .pipe(
        tap((updated) => {
          this.cachedNotifications = this.cachedNotifications.map((existing) =>
            existing.id === updated.id ? updated : existing,
          );
          this.notificationsSubject.next([...this.cachedNotifications]);
          this.updateUnreadCountFromCache();
        }),
      );
  }

  fetchUnreadCount(): Observable<number> {
    return this.http
      .get<{ count: number }>(`${this.baseUrl}/unread-count`)
      .pipe(
        map((res) => res.count),
        tap((count) => this.unreadCountSubject.next(count)),
      );
  }

  resetState(): void {
    this.cachedNotifications = [];
    this.unreadCountSubject.next(0);
    this.notificationsSubject.next([]);
  }

  private updateUnreadCountFromCache(): void {
    if (!this.cachedNotifications?.length) {
      this.unreadCountSubject.next(0);
      return;
    }

    const unread = this.cachedNotifications.filter(
      (notification) => !notification.isRead,
    ).length;
    this.unreadCountSubject.next(unread);
  }

  private buildWsNamespaceUrl(): string {
    const trimmed = environment.apiUrl.replace(/\/$/, '');
    if (trimmed.endsWith('/api')) {
      return `${trimmed.slice(0, -4)}/notifications`;
    }
    return `${trimmed}/notifications`;
  }

  private connectSocket(token: string): void {
    this.disconnectSocket();
    this.socket = io(this.wsNamespaceUrl, {
      transports: ['websocket'],
      auth: { token },
      autoConnect: true,
    });

    this.socket.on('notification:new', (notification: AppNotification) => {
      this.cachedNotifications = [
        notification,
        ...this.cachedNotifications,
      ].slice(0, 50);
      this.notificationsSubject.next([...this.cachedNotifications]);
      this.updateUnreadCountFromCache();
    });

    this.socket.on('notification:update', (notification: AppNotification) => {
      let found = false;
      this.cachedNotifications = this.cachedNotifications.map((existing) => {
        if (existing.id === notification.id) {
          found = true;
          return notification;
        }
        return existing;
      });
      if (!found) {
        this.cachedNotifications = [
          notification,
          ...this.cachedNotifications,
        ].slice(0, 50);
      }
      this.notificationsSubject.next([...this.cachedNotifications]);
      this.updateUnreadCountFromCache();
    });

    this.socket.on('notification:count', (payload: { count: number }) => {
      if (typeof payload?.count === 'number') {
        this.unreadCountSubject.next(payload.count);
      }
    });

    this.socket.on('disconnect', () => {
      // Socket.IO may try to reconnect automatically; nothing to do here.
    });
  }

  private disconnectSocket(): void {
    if (!this.socket) {
      return;
    }
    this.socket.removeAllListeners();
    this.socket.disconnect();
    this.socket = null;
  }
}
