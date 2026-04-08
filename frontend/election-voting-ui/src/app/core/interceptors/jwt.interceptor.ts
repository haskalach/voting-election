import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, shareReplay, finalize } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { RefreshTokenResponse } from '../models/models';
import { Observable } from 'rxjs';

let refreshInProgress$: Observable<RefreshTokenResponse> | null = null;

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/')) {
        // Use shared observable to prevent concurrent refresh requests
        if (!refreshInProgress$) {
          refreshInProgress$ = auth.refreshToken().pipe(
            shareReplay(1),
            finalize(() => (refreshInProgress$ = null)),
          );
        }

        return refreshInProgress$.pipe(
          switchMap((response) => {
            const retryReq = req.clone({
              setHeaders: { Authorization: `Bearer ${response.accessToken}` },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            // If refresh fails, propagate the original error
            return throwError(() => refreshError);
          }),
        );
      }
      return throwError(() => error);
    }),
  );
};
