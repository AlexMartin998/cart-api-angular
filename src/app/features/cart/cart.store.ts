import { HttpClient } from '@angular/common/http';
import { Service, computed, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { toApiError } from '../../core/http/api-error';
import { errorMessage } from '../../core/http/error-messages';
import { Cart, EMPTY_CART } from '../../core/models/cart';

/**
 * The cart lives on the server. This store only mirrors it: every mutation answers with the
 * recalculated cart and that answer replaces the state. Nothing here computes an amount.
 */
@Service()
export class CartStore {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/cart`;

  private readonly state = signal<Cart>(EMPTY_CART);
  private readonly loading = signal(false);
  private readonly failure = signal(false);
  private readonly errors = signal<ReadonlyMap<number, string>>(new Map());
  private readonly busy = signal<ReadonlySet<number>>(new Set());

  readonly cart = this.state.asReadonly();
  readonly isLoading = this.loading.asReadonly();
  readonly hasFailed = this.failure.asReadonly();

  readonly itemCount = computed(() => this.state().itemCount);
  readonly isEmpty = computed(() => this.state().items.length === 0);

  /** Lines the server refuses to sell: they do not add to the subtotal either. */
  readonly hasUnsellableLines = computed(() =>
    this.state().items.some((line) => line.status !== 'ok'),
  );

  readonly canCheckout = computed(() => !this.isEmpty() && !this.hasUnsellableLines());

  errorFor(productId: number): string | undefined {
    return this.errors().get(productId);
  }

  isBusy(productId: number): boolean {
    return this.busy().has(productId);
  }

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

  /** POST adds to whatever is already there. */
  add(productId: number, quantity = 1): void {
    this.mutate(productId, this.http.post<Cart>(`${this.url}/items`, { productId, quantity }));
  }

  /** PUT replaces the quantity; it does not add to it. */
  setQuantity(productId: number, quantity: number): void {
    if (quantity < 1) {
      this.remove(productId);
      return;
    }

    this.mutate(
      productId,
      this.http.put<Cart>(`${this.url}/items/${productId}`, { quantity }),
    );
  }

  remove(productId: number): void {
    this.mutate(productId, this.http.delete<Cart>(`${this.url}/items/${productId}`));
  }

  /** The only mutation that answers 204 instead of the cart, and it is idempotent. */
  clear(): void {
    this.http.delete<void>(this.url).subscribe({
      next: () => {
        this.state.set(EMPTY_CART);
        this.errors.set(new Map());
      },
    });
  }

  /**
   * The state is never changed before the server answers, so a rejected change needs no
   * rollback: what is on screen is still the last cart the server confirmed.
   */
  private mutate(productId: number, request: Observable<Cart>): void {
    this.forget(productId);
    this.busy.update((busy) => new Set(busy).add(productId));

    request.subscribe({
      next: (cart) => {
        this.state.set(cart);
        this.release(productId);
      },
      error: (error: unknown) => {
        this.errors.update((errors) =>
          new Map(errors).set(productId, errorMessage(toApiError(error))),
        );
        this.release(productId);
      },
    });
  }

  private forget(productId: number): void {
    this.errors.update((errors) => {
      const next = new Map(errors);
      next.delete(productId);
      return next;
    });
  }

  private release(productId: number): void {
    this.busy.update((busy) => {
      const next = new Set(busy);
      next.delete(productId);
      return next;
    });
  }
}
