import { HttpClient, HttpResourceRef, httpResource } from '@angular/common/http';
import { Service, Signal, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Paged } from '../../core/models/api';
import { Category, Product, ProductInput } from '../../core/models/catalog';

export const PAGE_SIZE = 10;

@Service()
export class AdminProductsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  listResource(page: Signal<number>): HttpResourceRef<Paged<Product> | undefined> {
    return httpResource<Paged<Product>>(() => ({
      url: `${this.baseUrl}/products`,
      params: { page: page(), pageSize: PAGE_SIZE },
    }));
  }

  categoriesResource(): HttpResourceRef<Category[] | undefined> {
    return httpResource<Category[]>(() => `${this.baseUrl}/categories`);
  }

  create(input: ProductInput): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/products`, input);
  }

  update(id: number, input: ProductInput): Observable<Product> {
    const { code, ...rest } = input;

    return this.http.put<Product>(`${this.baseUrl}/products/${id}`, rest);
  }

  deactivate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/products/${id}`);
  }
}
