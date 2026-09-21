import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { OrderTotals } from '../../../shared/ui/order-totals/order-totals';
import { CartStore } from '../cart.store';
import { CartLine } from '../ui/cart-line/cart-line';

@Component({
  selector: 'app-cart-page',
  imports: [RouterLink, OrderTotals, CartLine],
  templateUrl: './cart-page.html',
})
export default class CartPage {
  protected readonly store = inject(CartStore);
}
