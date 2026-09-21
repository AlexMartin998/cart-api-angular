import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

const NAV_LINKS = [
  { path: '/productos', label: 'Productos' },
  { path: '/carrito', label: 'Carrito' },
  { path: '/compras', label: 'Mis compras' },
] as const;

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
})
export default class Shell {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly links = NAV_LINKS;
  protected readonly user = this.auth.user;

  protected signOut(): void {
    this.auth.logout();
    void this.router.navigate(['/ingresar']);
  }
}
