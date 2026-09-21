import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { CartStore } from './cart.store';

const CART_URL = `${environment.apiUrl}/cart`;

const CART = {
  items: [
    {
      productId: 8,
      code: 'SKU-008',
      name: 'Camiseta básica',
      unitPrice: 15,
      quantity: 4,
      lineTotal: 60,
      availableStock: 45,
      status: 'ok',
    },
  ],
  itemCount: 4,
  subtotal: 60,
  discount: 0,
  total: 60,
};

function setUp() {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });

  return {
    store: TestBed.inject(CartStore),
    http: TestBed.inject(HttpTestingController),
  };
}

describe('CartStore', () => {
  it('starts empty, before anything is asked to the server', () => {
    const { store } = setUp();

    expect(store.isEmpty()).toBe(true);
    expect(store.itemCount()).toBe(0);
  });

  it('mirrors the cart the server sends', () => {
    const { store, http } = setUp();

    store.refresh();
    http.expectOne(CART_URL).flush(CART);

    expect(store.itemCount()).toBe(4);
    expect(store.cart().items[0].name).toBe('Camiseta básica');
    expect(store.isLoading()).toBe(false);
    http.verify();
  });

  it('takes the totals from the server without recomputing them', () => {
    const { store, http } = setUp();

    store.refresh();
    http.expectOne(CART_URL).flush({ ...CART, subtotal: 115, discount: 11.5, total: 103.5 });

    expect(store.cart().subtotal).toBe(115);
    expect(store.cart().discount).toBe(11.5);
    expect(store.cart().total).toBe(103.5);
  });

  it('knows when a line can no longer be sold', () => {
    const { store, http } = setUp();

    store.refresh();
    http.expectOne(CART_URL).flush({
      ...CART,
      items: [{ ...CART.items[0], status: 'insufficient_stock', availableStock: 2 }],
    });

    expect(store.hasUnsellableLines()).toBe(true);
  });

  it('reports a failed load instead of showing an empty cart', () => {
    const { store, http } = setUp();

    store.refresh();
    http.expectOne(CART_URL).flush(null, { status: 500, statusText: 'Server Error' });

    expect(store.hasFailed()).toBe(true);
    expect(store.isLoading()).toBe(false);
  });

  it('adds a product and mirrors the recalculated cart', () => {
    const { store, http } = setUp();

    store.add(8, 1);

    const request = http.expectOne(`${CART_URL}/items`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ productId: 8, quantity: 1 });
    request.flush({ ...CART, itemCount: 5, subtotal: 75, total: 75 });

    expect(store.itemCount()).toBe(5);
    expect(store.cart().total).toBe(75);
  });

  it('replaces the quantity with PUT instead of adding to it', () => {
    const { store, http } = setUp();

    store.setQuantity(8, 2);

    const request = http.expectOne(`${CART_URL}/items/8`);
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ quantity: 2 });
    request.flush(CART);
  });

  it('removes the line when the quantity drops below one', () => {
    const { store, http } = setUp();

    store.setQuantity(8, 0);

    const request = http.expectOne(`${CART_URL}/items/8`);
    expect(request.request.method).toBe('DELETE');
    request.flush({ ...CART, items: [], itemCount: 0, subtotal: 0, total: 0 });

    expect(store.isEmpty()).toBe(true);
  });

  it('keeps the confirmed cart when the server rejects the change', () => {
    const { store, http } = setUp();
    store.refresh();
    http.expectOne(CART_URL).flush(CART);

    store.setQuantity(8, 100);
    http
      .expectOne(`${CART_URL}/items/8`)
      .flush(
        { code: 'insufficient_stock', detail: 'Only 45 units of SKU-008 are left.' },
        { status: 409, statusText: 'Conflict' },
      );

    expect(store.cart().items[0].quantity).toBe(4);
    expect(store.cart().total).toBe(60);
    expect(store.errorFor(8)).toBe('No hay suficientes unidades disponibles.');
  });

  it('forgets the error of a line as soon as it is tried again', () => {
    const { store, http } = setUp();
    store.add(8);
    http
      .expectOne(`${CART_URL}/items`)
      .flush({ code: 'insufficient_stock' }, { status: 409, statusText: 'Conflict' });
    expect(store.errorFor(8)).toBeDefined();

    store.add(8);

    expect(store.errorFor(8)).toBeUndefined();
    http.expectOne(`${CART_URL}/items`).flush(CART);
  });

  it('empties the cart with a 204 that carries no body', () => {
    const { store, http } = setUp();
    store.refresh();
    http.expectOne(CART_URL).flush(CART);

    store.clear();
    const request = http.expectOne(CART_URL);
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });

    expect(store.isEmpty()).toBe(true);
  });

  it('refuses to let an unsellable cart reach the checkout', () => {
    const { store, http } = setUp();

    store.refresh();
    http.expectOne(CART_URL).flush({
      ...CART,
      items: [{ ...CART.items[0], status: 'unavailable' }],
    });

    expect(store.canCheckout()).toBe(false);
  });
});
