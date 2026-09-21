import { CurrencyPipe, DatePipe, DOCUMENT } from '@angular/common';
import { Component, inject, input, numberAttribute } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StatePanel } from '../../../shared/ui/state-panel/state-panel';
import { OrderTotals } from '../../../shared/ui/order-totals/order-totals';
import { OrdersService } from '../orders.service';

@Component({
  selector: 'app-order-detail',
  imports: [CurrencyPipe, DatePipe, RouterLink, OrderTotals, StatePanel],
  templateUrl: './order-detail.html',
})
export default class OrderDetail {
  readonly id = input.required({ transform: numberAttribute });

  protected readonly order = inject(OrdersService).orderResource(this.id);

  protected readonly justPlaced =
    inject(DOCUMENT).defaultView?.history.state?.['justPlaced'] === true;
}
