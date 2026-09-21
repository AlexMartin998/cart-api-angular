import { CurrencyPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { CartLine as Line } from '../../../../core/models/cart';

@Component({
  selector: 'li[appCartLine]',
  imports: [CurrencyPipe],
  templateUrl: './cart-line.html',
  host: {
    class: 'flex flex-wrap items-center gap-x-6 gap-y-3 border-b py-4',
    '[class.border-line]': "line().status === 'ok'",
    '[class.border-danger]': "line().status !== 'ok'",
  },
})
export class CartLine {
  readonly line = input.required<Line>();
  readonly busy = input(false);
  readonly error = input<string | undefined>(undefined);

  readonly quantityChange = output<number>();
  readonly removed = output<void>();
}
