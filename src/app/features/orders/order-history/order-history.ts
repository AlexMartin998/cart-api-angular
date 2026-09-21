import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Pager } from '../../../shared/ui/pager/pager';
import { StatePanel } from '../../../shared/ui/state-panel/state-panel';
import { OrdersService } from '../orders.service';

@Component({
  selector: 'app-order-history',
  imports: [CurrencyPipe, DatePipe, RouterLink, Pager, StatePanel],
  templateUrl: './order-history.html',
})
export default class OrderHistory {
  private readonly currentPage = signal(1);

  protected readonly page = this.currentPage.asReadonly();
  protected readonly history = inject(OrdersService).historyResource(this.page);
  protected readonly totalPages = computed(() =>
    this.history.hasValue() ? this.history.value()!.totalPages : 1,
  );

  protected goToPage(page: number): void {
    this.currentPage.set(page);
  }
}
