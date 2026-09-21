import {
  Component,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category, Product, ProductInput } from '../../../../core/models/catalog';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.html',
})
export class ProductForm {
  readonly editing = input<Product | null>(null);

  readonly opened = input(0);
  readonly categories = input.required<Category[]>();
  readonly saving = input(false);
  readonly failure = input<string | null>(null);

  readonly save = output<ProductInput>();
  readonly cancel = output<void>();

  protected readonly isNew = computed(() => this.editing() === null);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    code: ['', [Validators.required, Validators.maxLength(20)]],
    name: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', Validators.maxLength(500)],
    price: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(0.01),
      Validators.max(1_000_000),
    ]),
    stock: [0, [Validators.required, Validators.min(0), Validators.max(1_000_000)]],
    categoryId: [0, [Validators.required, Validators.min(1)]],
  });

  private readonly codeField = viewChild<ElementRef<HTMLInputElement>>('codeField');
  private readonly nameField = viewChild<ElementRef<HTMLInputElement>>('nameField');

  constructor() {
    effect(() => {
      this.opened();
      this.fill(this.editing());
    });

    afterNextRender(() => {
      const field = this.isNew() ? this.codeField() : this.nameField();
      field?.nativeElement.focus();
    });
  }

  private fill(product: Product | null): void {
    if (product === null) {
      this.form.reset({
        code: '',
        name: '',
        description: '',
        price: null,
        stock: 0,
        categoryId: 0,
      });
      this.form.controls.code.enable();
      return;
    }

    this.form.setValue({
      code: product.code,
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      stock: product.stock,
      categoryId: product.categoryId,
    });
    this.form.controls.code.disable();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();

    this.save.emit({
      code: value.code,
      name: value.name,
      description: value.description.trim() || null,
      price: Number(value.price),
      stock: Number(value.stock),
      categoryId: Number(value.categoryId),
    });
  }

  protected invalid(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }
}
