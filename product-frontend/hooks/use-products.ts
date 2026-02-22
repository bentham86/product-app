import { useQuery } from "@tanstack/react-query"
import { fetchProducts } from "@/services/products"
import type { ProductListParams } from "@/types/product"
import { config } from "@/lib/config"

const { defaultPerPage } = config.pagination

export function useProducts(params: ProductListParams = {}) {
  return useQuery({
    queryKey: [
      "products",
      params.page ?? 1,
      params.per_page ?? defaultPerPage,
      params.q ?? "",
      params.active ?? null,
    ],
    queryFn: () => fetchProducts(params),
  })
}
