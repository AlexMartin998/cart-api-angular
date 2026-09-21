import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import ProductList from './product-list';

const PAGE = {
  items: [
    {
      id: 1,
      code: 'SKU-001',
      name: 'Auriculares inalámbricos',
      description: 'Bluetooth 5.3, 30 h de batería',
      price: 59.9,
      stock: 25,
      categoryId: 1,
      categoryName: 'Electrónica',
    },
    {
      id: 11,
      code: 'SKU-011',
      name: 'Lámpara de escritorio',
      description: null,
      price: 79.99,
      stock: 0,
      categoryId: 2,
      categoryName: 'Hogar',
    },
  ],
  page: 1,
  pageSize: 12,
  totalItems: 2,
  totalPages: 1,
};

function render(): ComponentFixture<ProductList> {
  TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
  });

  const fixture = TestBed.createComponent(ProductList);
  TestBed.tick();

  TestBed.inject(HttpTestingController)
    .expectOne(`${environment.apiUrl}/categories`)
    .flush([{ id: 1, name: 'Electrónica' }]);

  return fixture;
}

function productsRequest() {
  return TestBed.inject(HttpTestingController).expectOne(
    (r) => r.url === `${environment.apiUrl}/products`,
  );
}

async function setUp(): Promise<{ fixture: ComponentFixture<ProductList>; element: HTMLElement }> {
  const fixture = render();
  productsRequest().flush(PAGE);

  await TestBed.inject(ApplicationRef).whenStable();
  fixture.detectChanges();

  return { fixture, element: fixture.nativeElement as HTMLElement };
}

describe('ProductList', () => {
  it('asks for the first page with its size', () => {
    render();

    const request = productsRequest();

    expect(request.request.params.get('page')).toBe('1');
    expect(request.request.params.get('pageSize')).toBe('12');
    request.flush(PAGE);
  });

  it('shows the catalogue with its available stock', async () => {
    const { element } = await setUp();

    expect(element.querySelectorAll('li')).toHaveLength(2);
    expect(element.textContent).toContain('Auriculares inalámbricos');
    expect(element.textContent).toContain('25 en stock');
  });

  it('marks a product without stock as sold out', async () => {
    const { element } = await setUp();

    expect(element.textContent).toContain('Agotado');
    expect(element.textContent).not.toContain('0 disponibles');
  });
});
