import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  UserInfo,
} from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Access token lives only in memory — never written to localStorage.
  // This prevents XSS from reading it even if a script is injected.
  private readonly REFRESH_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_info';

  private _accessToken = signal<string | null>(null);
  private _user = signal<UserInfo | null>(this.loadUser());

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isSystemOwner = computed(() => this._user()?.role === 'SystemOwner');
  readonly isManager = computed(() => this._user()?.role === 'Manager');
  readonly isEmployee = computed(() => this._user()?.role === 'Employee');

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, request)
      .pipe(
        tap((response) => {
          this._accessToken.set(response.accessToken);
          localStorage.setItem(this.REFRESH_KEY, response.refreshToken);
          localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
          this._user.set(response.user);
        }),
      );
  }

  logout(): void {
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      complete: () => this.clearSession(),
      error: () => this.clearSession(),
    });
  }

  refreshToken(): Observable<RefreshTokenResponse> {
    const refreshToken = localStorage.getItem(this.REFRESH_KEY);
    return this.http
      .post<RefreshTokenResponse>(`${environment.apiUrl}/auth/refresh`, {
        refreshToken,
      })
      .pipe(
        tap((response) => this._accessToken.set(response.accessToken)),
        catchError((err) => {
          this.clearSession();
          return throwError(() => err);
        }),
      );
  }

  getToken(): string | null {
    return this._accessToken();
  }

  hasRole(...roles: string[]): boolean {
    const role = this._user()?.role;
    return role ? roles.includes(role) : false;
  }

  private clearSession(): void {
    this._accessToken.set(null);
    localStorage.removeItem(this.REFRESH_KEY);
    localStorage.removeItem(this.USER_KEY);
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  private loadUser(): UserInfo | null {
    try {
      const raw = localStorage.getItem(this.USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
