export interface OrderLine {
  productId: number;
  productCode: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  placedAt: string;
  subtotal: number;
  discount: number;
  total: number;
  items: OrderLine[];
}

export interface OrderSummary {
  id: number;
  placedAt: string;
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
}
