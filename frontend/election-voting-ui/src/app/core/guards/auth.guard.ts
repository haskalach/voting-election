import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;

  router.navigate(['/login']);
  return false;
};

export const roleGuard =
  (...roles: string[]): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasRole(...roles)) return true;

    router.navigate(['/dashboard']);
    return false;
  };

export const loginGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) return true;

  router.navigate(['/dashboard']);
  return false;
};
