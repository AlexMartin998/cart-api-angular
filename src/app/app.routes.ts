import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/admin-guard';
import { guestOnlyGuard } from './core/auth/guest-only-guard';
import { signedInGuard } from './core/auth/signed-in-guard';

export const routes: Routes = [
  {
    path: 'ingresar',
    title: 'Ingresar',
    canMatch: [guestOnlyGuard],
    loadComponent: () => import('./features/auth/login/login'),
  },
  {
    path: '',
    canMatch: [signedInGuard],
    loadComponent: () => import('./core/layout/shell/shell'),
    children: [
      {
        path: 'productos',
        title: 'Productos',
        loadComponent: () => import('./features/products/product-list/product-list'),
      },
      {
        path: 'carrito',
        title: 'Tu carrito',
        loadComponent: () => import('./features/cart/cart-page/cart-page'),
      },
      {
        path: 'checkout',
        title: 'Confirmar compra',
        loadComponent: () => import('./features/checkout/checkout-page/checkout-page'),
      },
      {
        path: 'compras',
        title: 'Mis compras',
        loadComponent: () => import('./features/orders/order-history/order-history'),
      },
      {
        path: 'compras/:id',
        title: 'Detalle de la compra',
        loadComponent: () => import('./features/orders/order-detail/order-detail'),
      },

      {
        path: 'admin/productos',
        title: 'Administrar productos',
        canMatch: [adminGuard],
        loadComponent: () => import('./features/admin/admin-products-page/admin-products-page'),
      },
      { path: '', pathMatch: 'full', redirectTo: 'productos' },
    ],
  },
  { path: '**', redirectTo: '' },
];
