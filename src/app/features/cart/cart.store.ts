import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Cart, EMPTY_CART } from '../../core/models/cart';

@Service()
export class CartStore {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/cart`;

  private readonly state = signal<Cart>(EMPTY_CART);
  private readonly loading = signal(false);
  private readonly failure = signal(false);

  readonly cart = this.state.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly hasFailed = this.failure.asReadonly();

  readonly itemCount = computed(() => this.state().itemCount);
  readonly isEmpty = computed(() => this.state().items.length === 0);

  readonly hasUnsellableLines = computed(() =>
    this.state().items.some((line) => line.status !== 'ok'),
  );

  refresh(): void {
    this.loading.set(true);
    this.failure.set(false);

    this.http.get<Cart>(this.url).subscribe({
      next: (cart) => {
        this.state.set(cart);
        this.loading.set(false);
      },
      error: () => {
        this.failure.set(true);
        this.loading.set(false);
      },
    });
  }
}
