import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { Cart } from '../../../core/models/cart';
import { CartStore } from '../../cart/cart.store';
import CheckoutPage from './checkout-page';

const CART_URL = `${environment.apiUrl}/cart`;
const ORDERS_URL = `${environment.apiUrl}/orders`;

const CART: Cart = {
  items: [
    {
      productId: 8,
      code: 'SKU-008',
      name: 'Camiseta básica',
      unitPrice: 15,
      quantity: 5,
      lineTotal: 75,
      availableStock: 45,
      status: 'ok',
    },
  ],
  itemCount: 5,
  subtotal: 115,
  discount: 11.5,
  total: 103.5,
};

async function setUp(cart: Cart = CART) {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });

  const http = TestBed.inject(HttpTestingController);
  const store = TestBed.inject(CartStore);
  store.refresh();
  http.expectOne(CART_URL).flush(cart);

  const fixture: ComponentFixture<CheckoutPage> = TestBed.createComponent(CheckoutPage);
  await fixture.whenStable();

  return { fixture, http, element: fixture.nativeElement as HTMLElement };
}

function confirmButton(element: HTMLElement): HTMLButtonElement {
  return [...element.querySelectorAll('button')].find((b) =>
    b.textContent?.includes('Confirmar'),
  )!;
}

describe('CheckoutPage', () => {
  it('shows the breakdown exactly as the server sent it', async () => {
    const { element } = await setUp();

    expect(element.textContent).toContain('$115.00');
    expect(element.textContent).toContain('$11.50');
    expect(element.textContent).toContain('$103.50');
  });

  it('places the order with no body and goes to its detail', async () => {
    const { fixture, http, element } = await setUp();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);

    confirmButton(element).click();
    await fixture.whenStable();

    const request = http.expectOne(ORDERS_URL);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeNull();
    request.flush({ id: 7, placedAt: '2026-09-20T21:41:07Z', subtotal: 115, discount: 11.5, total: 103.5, items: [] });
    await fixture.whenStable();

    expect(navigate).toHaveBeenCalledWith(['/compras', 7], { state: { justPlaced: true } });
    http.expectOne(CART_URL).flush({ items: [], itemCount: 0, subtotal: 0, discount: 0, total: 0 });
  });

  it('explains a rejected purchase and reloads the cart', async () => {
    const { fixture, http, element } = await setUp();

    confirmButton(element).click();
    await fixture.whenStable();

    http
      .expectOne(ORDERS_URL)
      .flush({ code: 'insufficient_stock' }, { status: 409, statusText: 'Conflict' });
    await fixture.whenStable();

    expect(element.textContent).toContain('No hay suficientes unidades disponibles.');
    http.expectOne(CART_URL).flush(CART);
  });

  it('does not let an unsellable cart be confirmed', async () => {
    const { element } = await setUp({
      ...CART,
      items: [{ ...CART.items[0], status: 'unavailable' as const }],
    });

    expect(confirmButton(element).disabled).toBe(true);
    expect(element.textContent).toContain('ya no se pueden vender');
  });

  it('sends an empty cart back to the catalogue', async () => {
    const { element } = await setUp({
      items: [],
      itemCount: 0,
      subtotal: 0,
      discount: 0,
      total: 0,
    });

    expect(element.textContent).toContain('Tu carrito está vacío');
  });
});
