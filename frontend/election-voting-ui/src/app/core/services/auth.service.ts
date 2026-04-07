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
  private readonly TOKEN_KEY = 'access_token';
  private readonly REFRESH_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_info';

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
          localStorage.setItem(this.TOKEN_KEY, response.accessToken);
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
        tap((response) =>
          localStorage.setItem(this.TOKEN_KEY, response.accessToken),
        ),
        catchError((err) => {
          this.clearSession();
          return throwError(() => err);
        }),
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  hasRole(...roles: string[]): boolean {
    const role = this._user()?.role;
    return role ? roles.includes(role) : false;
  }

  private clearSession(): void {
    localStorage.removeItem(this.TOKEN_KEY);
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
