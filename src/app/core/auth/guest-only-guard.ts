import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const guestOnlyGuard: CanMatchFn = () => {
  const auth = inject(AuthService);

  return !auth.isSignedIn() || inject(Router).createUrlTree(['/productos']);
};
