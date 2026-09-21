import { Service, computed, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Paged } from '../../core/models/api';
import { Category, Product } from '../../core/models/catalog';

const PAGE_SIZE = 12;

interface Query {
  search: string;
  categoryId: number | null;
  page: number;
}

@Service()
export class ProductsService {
  private readonly baseUrl = environment.apiUrl;

  private readonly query = signal<Query>({ search: '', categoryId: null, page: 1 });

  readonly products = httpResource<Paged<Product>>(() => ({
    url: `${this.baseUrl}/products`,
    params: toParams(this.query()),
  }));

  readonly categories = httpResource<Category[]>(() => `${this.baseUrl}/categories`);

  readonly page = computed(() => this.query().page);
  readonly totalPages = computed(() =>
    this.products.hasValue() ? this.products.value().totalPages : 1,
  );

  setSearch(search: string): void {
    this.query.update((query) => ({ ...query, search, page: 1 }));
  }

  setCategory(categoryId: number | null): void {
    this.query.update((query) => ({ ...query, categoryId, page: 1 }));
  }

  goToPage(page: number): void {
    this.query.update((query) => ({ ...query, page }));
  }
}

// empty filter values are omitted
function toParams(query: Query): Record<string, string | number> {
  return {
    page: query.page,
    pageSize: PAGE_SIZE,
    ...(query.search ? { search: query.search } : {}),
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
  };
}
