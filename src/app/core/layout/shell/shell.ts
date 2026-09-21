import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CartStore } from '../../../features/cart/cart.store';
import { AuthService } from '../../auth/auth.service';

const NAV_LINKS = [
  { path: '/productos', label: 'Productos', badge: false },
  { path: '/carrito', label: 'Carrito', badge: true },
  { path: '/compras', label: 'Mis compras', badge: false },
] as const;

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export default class Shell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  private readonly cart = inject(CartStore);

  protected readonly links = NAV_LINKS;
  protected readonly user = this.auth.user;
  protected readonly itemCount = this.cart.itemCount;

  constructor() {
    this.cart.refresh();
  }

  protected signOut(): void {
    this.auth.logout();
    void this.router.navigate(['/ingresar']);
  }
}
