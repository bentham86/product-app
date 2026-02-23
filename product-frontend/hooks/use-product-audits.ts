import { useQuery } from "@tanstack/react-query"
import { fetchProductAudits } from "@/services/products"

export function useProductAudits(productId: number | undefined) {
  return useQuery({
    queryKey: ["product-audits", productId],
    queryFn: () => fetchProductAudits(productId!),
    enabled: productId !== undefined,
  })
}
