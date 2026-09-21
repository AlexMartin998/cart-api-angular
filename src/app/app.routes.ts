import { Routes } from '@angular/router';
import { guestOnlyGuard } from './core/auth/guest-only-guard';

export const routes: Routes = [
  {
    path: 'ingresar',
    title: 'Ingresar',
    canMatch: [guestOnlyGuard],
    loadComponent: () => import('./features/auth/login/login'),
  },
  { path: '', pathMatch: 'full', redirectTo: 'ingresar' },
];
