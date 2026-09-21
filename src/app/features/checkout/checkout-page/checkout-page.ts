import { CurrencyPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toApiError } from '../../../core/http/api-error';
import { errorMessage } from '../../../core/http/error-messages';
import { OrderTotals } from '../../../shared/ui/order-totals/order-totals';
import { CartStore } from '../../cart/cart.store';
import { OrdersService } from '../../orders/orders.service';

@Component({
  selector: 'app-checkout-page',
  imports: [CurrencyPipe, RouterLink, OrderTotals],
  templateUrl: './checkout-page.html',
})
export default class CheckoutPage {
  private readonly orders = inject(OrdersService);
  private readonly router = inject(Router);

  protected readonly store = inject(CartStore);
  protected readonly placing = signal(false);
  protected readonly failure = signal<string | null>(null);

  protected confirm(): void {
    this.placing.set(true);
    this.failure.set(null);

    this.orders.place().subscribe({
      next: (order) => {
        this.store.refresh();
        void this.router.navigate(['/compras', order.id], { state: { justPlaced: true } });
      },
      error: (error: unknown) => {
        this.placing.set(false);
        this.failure.set(errorMessage(toApiError(error)));
        this.store.refresh();
      },
    });
  }
}
