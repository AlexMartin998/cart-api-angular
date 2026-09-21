import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'ingresar',
    title: 'Ingresar',
    loadComponent: () => import('./features/auth/login/login'),
  },
  { path: '', pathMatch: 'full', redirectTo: 'ingresar' },
];
