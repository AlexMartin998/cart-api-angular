import { Service } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Paged } from '../../core/models/api';
import { Product } from '../../core/models/catalog';

const PAGE_SIZE = 12;

@Service()
export class ProductsService {
  private readonly baseUrl = environment.apiUrl;

  readonly products = httpResource<Paged<Product>>(() => ({
    url: `${this.baseUrl}/products`,
    params: { page: 1, pageSize: PAGE_SIZE },
  }));
}
