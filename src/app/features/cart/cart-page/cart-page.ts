import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CartStore } from '../cart.store';

@Component({
  selector: 'app-cart-page',
  imports: [CurrencyPipe],
  templateUrl: './cart-page.html',
})
export default class CartPage {
  protected readonly store = inject(CartStore);
}
