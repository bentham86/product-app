import type {
  Product,
  ProductListItem,
  ProductListResponse,
  ProductInput,
  PaginationMeta,
} from "@/types/product"

export const fixtureProduct: Product = {
  id: 1,
  name: "Test Product",
  description: "A test product",
  price: "29.99",
  stock: 10,
  sku: "TEST001",
  active: true,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
}

export const fixtureProductListItem: ProductListItem = {
  id: 1,
  name: "Test Product",
  price: "29.99",
  sku: "TEST001",
  active: true,
}

export const fixtureProductListResponse: ProductListResponse = {
  data: [fixtureProductListItem],
  meta: {
    current_page: 1,
    per_page: 10,
    total_pages: 1,
    total_count: 1,
  },
}

export const fixtureEmptyListResponse: ProductListResponse = {
  data: [],
  meta: {
    current_page: 1,
    per_page: 10,
    total_pages: 0,
    total_count: 0,
  } as PaginationMeta,
}

export const fixtureProductInput: ProductInput = {
  name: "New Product",
  description: "Description",
  price: 19.99,
  stock: 5,
  sku: "NEW001",
  active: true,
}
