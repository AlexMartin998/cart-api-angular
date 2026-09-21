import { CurrencyPipe } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-order-totals',
  imports: [CurrencyPipe],
  templateUrl: './order-totals.html',
})
export class OrderTotals {
  readonly subtotal = input.required<number>();
  readonly discount = input.required<number>();
  readonly total = input.required<number>();
}
