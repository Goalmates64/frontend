import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {distinctUntilChanged, tap} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {User} from './models/user.model';
import {LoginPayload, LoginResponse, RegisterPayload,} from './models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenKey = 'gm_token';

  private readonly isAuthenticatedSubject = new BehaviorSubject<boolean>(
    !!localStorage.getItem('gm_token')
  );
  readonly isAuthenticated$: Observable<boolean> =
    this.isAuthenticatedSubject.asObservable().pipe(distinctUntilChanged());

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  readonly currentUser$ = this.currentUserSubject.asObservable();

  constructor(private readonly http: HttpClient) {
    const token = localStorage.getItem(this.tokenKey);

    if (token) {
      this.fetchProfile().subscribe({
        error: () => this.logout(),
      });
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
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  fetchProfile() {
    return this.http
      .get<User>(`${environment.apiUrl}/auth/me`)
      .pipe(tap((user) => this.currentUserSubject.next(user)));
  }

  private handleAuthSuccess(res: LoginResponse): void {
    localStorage.setItem(this.tokenKey, res.access_token);
    this.currentUserSubject.next(res.user);
    this.isAuthenticatedSubject.next(true);
  }
}
