import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Order } from '../../core/models/order';

@Service()
export class OrdersService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/orders`;

  place(): Observable<Order> {
    return this.http.post<Order>(this.url, null);
  }
}
