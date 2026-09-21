import { HttpClient, HttpResourceRef, httpResource } from '@angular/common/http';
import { Service, Signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paged } from '../../core/models/api';
import { Order, OrderSummary } from '../../core/models/order';

const PAGE_SIZE = 10;

@Service()
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/orders`;

  // resources are factories, not fields: a field fires as soon as ANY screen injects this
  historyResource(page: Signal<number>): HttpResourceRef<Paged<OrderSummary> | undefined> {
    return httpResource<Paged<OrderSummary>>(() => ({
      url: this.url,
      params: { page: page(), pageSize: PAGE_SIZE },
    }));
  }

  orderResource(id: Signal<number>): HttpResourceRef<Order | undefined> {
    return httpResource<Order>(() => `${this.url}/${id()}`);
  }

  place(): Observable<Order> {
    return this.http.post<Order>(this.url, null);
  }
}
