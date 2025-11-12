import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, take} from 'rxjs';
import {map, tap} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {AppNotification} from './models/notification.model';
import {AuthService} from './auth.service';

@Injectable({providedIn: 'root'})
export class NotificationsService {
  private readonly baseUrl = `${environment.apiUrl}/notifications`;
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this.unreadCountSubject.asObservable();
  private cachedNotifications: AppNotification[] = [];

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {
    this.authService.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.fetchUnreadCount().pipe(take(1)).subscribe({
          error: () => this.unreadCountSubject.next(0),
        });
      } else {
        this.resetState();
      }
    });
  }

  loadAll(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.baseUrl).pipe(
      tap((notifications) => {
        this.cachedNotifications = notifications;
        this.updateUnreadCountFromCache();
      }),
    );
  }

  markAsRead(notificationId: number, isRead: boolean): Observable<AppNotification> {
    return this.http
      .patch<AppNotification>(`${this.baseUrl}/${notificationId}/read`, {isRead})
      .pipe(
        tap((updated) => {
          this.cachedNotifications = this.cachedNotifications.map((existing) =>
            existing.id === updated.id ? updated : existing,
          );
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
  }

  private updateUnreadCountFromCache(): void {
    if (!this.cachedNotifications?.length) {
      this.unreadCountSubject.next(0);
      return;
    }

    const unread = this.cachedNotifications.filter((notification) => !notification.isRead).length;
    this.unreadCountSubject.next(unread);
  }
}
