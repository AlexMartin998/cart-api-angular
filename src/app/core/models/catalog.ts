export interface Product {
  id: number;
  code: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: number;
  categoryName: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface ProductQuery {
  search: string;
  categoryId: number | null;
  page: number;
  pageSize: number;
}

export interface ProductInput {
  code: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  categoryId: number;
}
