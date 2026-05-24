import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true; // Si tiene token, lo deja pasar
  } else {
    router.navigate(['/login']); // Si no tiene token, lo patea al login
    return false;
  }
};
