import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductsService } from '../products.service';

const TYPING_PAUSE_MS = 300;

@Component({
  selector: 'app-product-list',
  imports: [CurrencyPipe, ReactiveFormsModule],
  templateUrl: './product-list.html',
})
export default class ProductList {
  private readonly service = inject(ProductsService);

  protected readonly products = this.service.products;
  protected readonly categories = this.service.categories;
  protected readonly page = this.service.page;
  protected readonly totalPages = this.service.totalPages;

  protected readonly search = new FormControl('', { nonNullable: true });

  constructor() {
    this.search.valueChanges
      .pipe(debounceTime(TYPING_PAUSE_MS), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((term) => this.service.setSearch(term.trim()));
  }

  protected filterByCategory(value: string): void {
    this.service.setCategory(value ? Number(value) : null);
  }

  protected goToPage(page: number): void {
    this.service.goToPage(page);
  }
}
