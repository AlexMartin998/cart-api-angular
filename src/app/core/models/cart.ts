export type CartLineStatus = 'ok' | 'insufficient_stock' | 'unavailable';

export interface CartLine {
  productId: number;
  code: string | null;
  name: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  availableStock: number;
  status: CartLineStatus;
}

export interface Cart {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
}

export const EMPTY_CART: Cart = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  discount: 0,
  total: 0,
};
