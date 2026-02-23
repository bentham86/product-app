import type {
  ProductListParams,
  ProductListResponse,
  Product,
  ProductInput,
  ApiError,
  ProductAudit,
  ProductAuditListResponse,
} from "@/types/product"
import {
  getMockProducts,
  getNextId,
  setMockProducts,
} from "@/lib/mock-data"
import { config } from "@/lib/config"

const { baseUrl: API_BASE_URL, useMock: USE_MOCK, timeout: API_TIMEOUT } = config.api

function delay(ms: number = config.mock.delay): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function apiRequest<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
    })

    if (!res.ok) {
      const errorBody = (await res.json()) as ApiError
      throw errorBody
    }

    if (res.status === 204) {
      return undefined as T
    }

    return res.json() as Promise<T>
  } finally {
    clearTimeout(timeoutId)
  }
}

// --- Fetch Products (list) ---

export async function fetchProducts(
  params: ProductListParams = {}
): Promise<ProductListResponse> {
  if (USE_MOCK) {
    return fetchProductsMock(params)
  }

  const searchParams = new URLSearchParams()
  if (params.page) searchParams.set("page", String(params.page))
  if (params.per_page) searchParams.set("per_page", String(params.per_page))
  if (params.q) searchParams.set("q", params.q)
  if (params.active !== null && params.active !== undefined) {
    searchParams.set("active", String(params.active))
  }

  const query = searchParams.toString()
  return apiRequest<ProductListResponse>(
    `/api/v1/products${query ? `?${query}` : ""}`
  )
}

async function fetchProductsMock(
  params: ProductListParams
): Promise<ProductListResponse> {
  await delay()

  const page = params.page ?? 1
  const perPage = params.per_page ?? config.pagination.defaultPerPage

  let products = [...getMockProducts()]

  // Search filter
  if (params.q) {
    const query = params.q.toLowerCase()
    products = products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
    )
  }

  // Active filter
  if (params.active !== null && params.active !== undefined) {
    products = products.filter((p) => p.active === params.active)
  }

  const totalCount = products.length
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage))
  const start = (page - 1) * perPage
  const paginatedProducts = products.slice(start, start + perPage)

  return {
    data: paginatedProducts.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      sku: p.sku,
      active: p.active,
    })),
    meta: {
      current_page: page,
      per_page: perPage,
      total_pages: totalPages,
      total_count: totalCount,
    },
  }
}

// --- Fetch Single Product ---

export async function fetchProduct(id: number): Promise<Product> {
  if (USE_MOCK) {
    return fetchProductMock(id)
  }

  const res = await apiRequest<{ data: Product }>(`/api/v1/products/${id}`)
  return res.data
}

async function fetchProductMock(id: number): Promise<Product> {
  await delay(300)

  const product = getMockProducts().find((p) => p.id === id)
  if (!product) {
    throw {
      error: {
        code: "not_found",
        message: `Product with id ${id} not found`,
      },
    } satisfies ApiError
  }

  return { ...product }
}

// --- Create Product ---

export async function createProduct(input: ProductInput): Promise<Product> {
  if (USE_MOCK) {
    return createProductMock(input)
  }

  const res = await apiRequest<{ data: Product }>("/api/v1/products", {
    method: "POST",
    body: JSON.stringify(input),
  })
  return res.data
}

async function createProductMock(input: ProductInput): Promise<Product> {
  await delay(500)

  const products = getMockProducts()

  // Check duplicate SKU
  if (products.some((p) => p.sku === input.sku.toUpperCase())) {
    throw {
      error: {
        code: "validation_error",
        message: "Validation failed",
        details: { sku: ["has already been taken"] },
      },
    } satisfies ApiError
  }

  const now = new Date().toISOString()
  const newProduct: Product = {
    id: getNextId(),
    name: input.name,
    description: input.description ?? null,
    price: input.price.toFixed(2),
    stock: input.stock,
    sku: input.sku.toUpperCase(),
    active: input.active ?? true,
    created_at: now,
    updated_at: now,
  }

  setMockProducts([newProduct, ...products])
  return { ...newProduct }
}

// --- Update Product ---

export async function updateProduct(
  id: number,
  input: Partial<ProductInput>
): Promise<Product> {
  if (USE_MOCK) {
    return updateProductMock(id, input)
  }

  const res = await apiRequest<{ data: Product }>(`/api/v1/products/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  })
  return res.data
}

async function updateProductMock(
  id: number,
  input: Partial<ProductInput>
): Promise<Product> {
  await delay(500)

  const products = getMockProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) {
    throw {
      error: {
        code: "not_found",
        message: `Product with id ${id} not found`,
      },
    } satisfies ApiError
  }

  // Check duplicate SKU (excluding current product)
  if (
    input.sku &&
    products.some(
      (p) => p.sku === input.sku!.toUpperCase() && p.id !== id
    )
  ) {
    throw {
      error: {
        code: "validation_error",
        message: "Validation failed",
        details: { sku: ["has already been taken"] },
      },
    } satisfies ApiError
  }

  const updated: Product = {
    ...products[index],
    ...(input.name !== undefined && { name: input.name }),
    ...(input.description !== undefined && {
      description: input.description ?? null,
    }),
    ...(input.price !== undefined && { price: input.price.toFixed(2) }),
    ...(input.stock !== undefined && { stock: input.stock }),
    ...(input.sku !== undefined && { sku: input.sku.toUpperCase() }),
    ...(input.active !== undefined && { active: input.active }),
    updated_at: new Date().toISOString(),
  }

  products[index] = updated
  setMockProducts(products)
  return { ...updated }
}

// --- Delete Product ---

export async function deleteProduct(id: number): Promise<void> {
  if (USE_MOCK) {
    return deleteProductMock(id)
  }

  await apiRequest<void>(`/api/v1/products/${id}`, { method: "DELETE" })
}

async function deleteProductMock(id: number): Promise<void> {
  await delay(400)

  const products = getMockProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) {
    throw {
      error: {
        code: "not_found",
        message: `Product with id ${id} not found`,
      },
    } satisfies ApiError
  }

  setMockProducts(products.filter((p) => p.id !== id))
}

// --- Product audits (historial) ---

export async function fetchProductAudits(
  productId: number
): Promise<ProductAuditListResponse> {
  if (USE_MOCK) {
    return fetchProductAuditsMock(productId)
  }

  return apiRequest<ProductAuditListResponse>(
    `/api/v1/products/${productId}/audits`
  )
}

async function fetchProductAuditsMock(
  _productId: number
): Promise<ProductAuditListResponse> {
  await delay(300)
  return { data: [] }
}
