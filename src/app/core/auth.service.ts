import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from './models/user.model';
import {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
} from './models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'gm_token';
  private readonly userKey = 'gm_user';

  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(
    !!localStorage.getItem(this.tokenKey)
  );
  readonly isAuthenticated$: Observable<boolean> =
    this.isAuthenticatedSubject.asObservable().pipe(distinctUntilChanged());

  private readonly currentUserSubject = new BehaviorSubject<User | null>(
    this.readUserFromStorage()
  );
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    const token = localStorage.getItem(this.tokenKey);

    if (token) {
      this.refreshSessionFromApi();
    }
  }

  get token(): string | null {
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
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  fetchProfile() {
    return this.http
      .get<User>(`${environment.apiUrl}/auth/me`)
      .pipe(tap((user) => this.persistUser(user)));
  }

  private handleAuthSuccess(res: LoginResponse): void {
    localStorage.setItem(this.tokenKey, res.access_token);
    this.persistUser(res.user);
  }

  private persistUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.isAuthenticatedSubject.next(true);
  }

  private readUserFromStorage(): User | null {
    const raw = localStorage.getItem(this.userKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as User;
    } catch (error) {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  private refreshSessionFromApi(): void {
    this.fetchProfile().subscribe({
      error: (error) => this.handleProfileRefreshError(error),
    });
  }

  private handleProfileRefreshError(error: unknown): void {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 || error.status === 403) {
        this.logout();
        return;
      }
    }

    console.warn('Failed to refresh session from API', error);
  }
}
