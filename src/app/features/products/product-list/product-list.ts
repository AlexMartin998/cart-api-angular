import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe],
  templateUrl: './product-list.html',
})
export default class ProductList {
  protected readonly products = inject(ProductsService).products;
}
