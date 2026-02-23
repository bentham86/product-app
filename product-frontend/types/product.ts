export interface Product {
  id: number
  name: string
  description: string | null
  price: string // decimal string from API e.g. "29.99"
  stock: number
  sku: string
  active: boolean
  created_at: string
  updated_at: string
}

export interface ProductListItem {
  id: number
  name: string
  price: string
  sku: string
  active: boolean
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total_pages: number
  total_count: number
}

export interface ProductListResponse {
  data: ProductListItem[]
  meta: PaginationMeta
}

export interface ProductResponse {
  data: Product
}

export interface ProductInput {
  name: string
  description?: string
  price: number
  stock: number
  sku: string
  active?: boolean
}

export interface ApiError {
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

export interface ProductListParams {
  page?: number
  per_page?: number
  q?: string
  active?: boolean | null
}

// --- Product audit (historial) ---

export interface ProductAuditChanges {
  name?: string
  description?: string | null
  price?: string
  stock?: number
  sku?: string
  active?: boolean
  deleted_at?: string | null
  [key: string]: string | number | boolean | null | undefined
}

export interface ProductAudit {
  id: number
  action: string
  changes: ProductAuditChanges
  created_at: string
}

export interface ProductAuditListResponse {
  data: ProductAudit[]
}
