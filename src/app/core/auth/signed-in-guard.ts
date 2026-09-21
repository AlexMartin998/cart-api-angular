import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const signedInGuard: CanMatchFn = () => {
  const auth = inject(AuthService);

  return auth.isSignedIn() || inject(Router).createUrlTree(['/ingresar']);
};
