import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {distinctUntilChanged, tap} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {UpdateProfilePayload, User} from './models/user.model';
import {LoginPayload, LoginResponse, RegisterPayload,} from './models/auth.model';
import {ToastService} from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'gm_token';
  private readonly userKey = 'gm_user';
  private readonly tokenExpiryKey = 'gm_token_exp';
  private expiryTimer: ReturnType<typeof setTimeout> | null = null;

  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(
    !!localStorage.getItem(this.tokenKey)
  );
  readonly isAuthenticated$: Observable<boolean> =
    this.isAuthenticatedSubject.asObservable().pipe(distinctUntilChanged());

  private readonly currentUserSubject = new BehaviorSubject<User | null>(
    this.readUserFromStorage()
  );
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly toast: ToastService,
  ) {
    const token = localStorage.getItem(this.tokenKey);

    if (!token) {
      return;
    }

    if (this.isTokenExpired()) {
      this.handleTokenExpiration();
      return;
    }

    this.scheduleTokenExpiration();
    this.refreshSessionFromApi();
  }

  get token(): string | null {
    if (this.isTokenExpired()) {
      this.logout();
      return null;
    }

    return localStorage.getItem(this.tokenKey);
  }

  register(payload: RegisterPayload) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap((res) => this.handleAuthSuccess(res)));
  }

  login(payload: LoginPayload) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap((res) => this.handleAuthSuccess(res)));
  }

  logout(): void {
    this.clearExpiryTimer();
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenExpiryKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  fetchProfile() {
    return this.http
      .get<User>(`${environment.apiUrl}/users/me`)
      .pipe(tap((user) => this.persistUser(user)));
  }

  updateProfile(payload: UpdateProfilePayload) {
    return this.http
      .patch<User>(`${environment.apiUrl}/users/me`, payload)
      .pipe(tap((user) => this.persistUser(user)));
  }

  uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<User>(`${environment.apiUrl}/users/me/avatar`, formData)
      .pipe(tap((user) => this.persistUser(user)));
  }

  private handleAuthSuccess(res: LoginResponse): void {
    this.storeToken(res.access_token);
    this.persistUser(res.user);
  }

  private persistUser(user: User): void {
    const normalized = this.toUserShape(user);
    if (!normalized) {
      return;
    }

    this.currentUserSubject.next(normalized);
    localStorage.setItem(this.userKey, JSON.stringify(normalized));
    this.isAuthenticatedSubject.next(true);
  }

  private readUserFromStorage(): User | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }

    try {
      const parsed = JSON.parse(raw);
      const normalized = this.toUserShape(parsed);
      if (!normalized) {
        localStorage.removeItem(this.userKey);
        return null;
      }

      return normalized;
    } catch (error) {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  private toUserShape(user: any): User | null {
    if (!user || typeof user !== 'object') {
      return null;
    }

    if (user.id === undefined || user.email === undefined || user.username === undefined) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      dateOfBirth: user.dateOfBirth ?? null,
      city: user.city ?? null,
      country: user.country ?? null,
      avatarUrl: user.avatarUrl ?? null,
    };
  }

  private refreshSessionFromApi(): void {
    if (this.isTokenExpired()) {
      this.handleTokenExpiration();
      return;
    }

    this.fetchProfile().subscribe({
      error: (error) => this.handleProfileRefreshError(error),
    });
  }

  private handleProfileRefreshError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 || error.status === 403) {
        this.handleTokenExpiration();
        return;
      }
    }

    console.warn('Failed to refresh session from API', error);
  }

  private storeToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    const expiry = this.decodeTokenExpiry(token);

    if (expiry) {
      localStorage.setItem(this.tokenExpiryKey, expiry.toString());
      this.scheduleTokenExpiration(expiry);
    } else {
      localStorage.removeItem(this.tokenExpiryKey);
      this.clearExpiryTimer();
    }
  }

  private decodeTokenExpiry(token: string): number | null {
    try {
      const [, payload] = token.split('.');
      if (!payload) {
        return null;
      }

      const decoded = JSON.parse(atob(payload));
      if (decoded?.exp) {
        return decoded.exp * 1000;
      }
    } catch (error) {
      console.warn('Impossible de décoder le token JWT', error);
    }

    return null;
  }

  private readTokenExpiry(): number | null {
    const raw = localStorage.getItem(this.tokenExpiryKey);
    if (!raw) {
      return null;
    }

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private isTokenExpired(): boolean {
    const expiry = this.readTokenExpiry();
    if (!expiry) {
      return false;
    }

    return Date.now() >= expiry;
  }

  private scheduleTokenExpiration(expiration?: number): void {
    const expiry = expiration ?? this.readTokenExpiry();
    if (!expiry) {
      return;
    }

    const delay = expiry - Date.now();
    if (delay <= 0) {
      this.handleTokenExpiration();
      return;
    }

    this.clearExpiryTimer();
    // @ts-ignore
    this.expiryTimer = window.setTimeout(() => {
      this.handleTokenExpiration();
    }, delay);
  }

  private clearExpiryTimer(): void {
    if (this.expiryTimer) {
      window.clearTimeout(this.expiryTimer);
      this.expiryTimer = null;
    }
  }

  private handleTokenExpiration(): void {
    this.clearExpiryTimer();
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenExpiryKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
    this.toast.info('Ta session a expiré. Merci de te reconnecter.');
  }
}
