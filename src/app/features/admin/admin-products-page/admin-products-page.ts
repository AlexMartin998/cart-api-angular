import { CurrencyPipe } from '@angular/common';
import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { toApiError } from '../../../core/http/api-error';
import { errorMessage } from '../../../core/http/error-messages';
import { Product, ProductInput } from '../../../core/models/catalog';
import { Pager } from '../../../shared/ui/pager/pager';
import { StatePanel } from '../../../shared/ui/state-panel/state-panel';
import { categoryTone } from '../../products/catalog-visuals';
import { AdminProductsService } from '../admin-products.service';
import { ProductForm } from '../ui/product-form/product-form';

@Component({
  selector: 'app-admin-products-page',
  imports: [CurrencyPipe, StatePanel, Pager, ProductForm],
  templateUrl: './admin-products-page.html',
})
export default class AdminProductsPage {
  private readonly service = inject(AdminProductsService);
  private readonly currentPage = signal(1);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  protected readonly page = this.currentPage.asReadonly();
  protected readonly products = this.service.listResource(this.page);
  protected readonly categories = this.service.categoriesResource();
  protected readonly totalPages = computed(() =>
    this.products.hasValue() ? this.products.value()!.totalPages : 1,
  );

  protected readonly editing = signal<Product | null>(null);
  protected readonly open = signal(false);
  protected readonly opened = signal(0);
  protected readonly saving = signal(false);
  protected readonly failure = signal<string | null>(null);
  protected readonly notice = signal<string | null>(null);

  protected readonly tone = categoryTone;

  constructor() {
    effect(() => {
      const element = this.dialog().nativeElement;

      if (this.open()) {
        if (!element.open) {
          element.showModal();
        }
      } else if (element.open) {
        element.close();
      }
    });
  }

  protected dismiss(event: MouseEvent): void {
    if (event.target === this.dialog().nativeElement) {
      this.close();
    }
  }

  protected startNew(): void {
    this.openWith(null);
  }

  protected startEdit(product: Product): void {
    this.openWith(product);
  }

  protected close(): void {
    this.open.set(false);
    this.failure.set(null);
  }

  protected submit(input: ProductInput): void {
    const target = this.editing();

    this.saving.set(true);
    this.failure.set(null);

    const request = target ? this.service.update(target.id, input) : this.service.create(input);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.open.set(false);
        this.notice.set(target ? `«${input.name}» actualizado.` : `«${input.name}» creado.`);
        this.products.reload();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.failure.set(errorMessage(toApiError(error)));
      },
    });
  }

  protected withdraw(product: Product): void {
    this.notice.set(null);

    this.service.deactivate(product.id).subscribe({
      next: () => {
        this.notice.set(`«${product.name}» ya no se vende.`);
        this.products.reload();
      },
      error: (error: unknown) => this.notice.set(errorMessage(toApiError(error))),
    });
  }

  protected goToPage(page: number): void {
    this.currentPage.set(page);
  }

  private openWith(product: Product | null): void {
    this.editing.set(product);
    this.failure.set(null);
    this.open.set(true);
    this.opened.update((n) => n + 1);
  }
}
