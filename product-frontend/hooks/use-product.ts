import { useQuery } from "@tanstack/react-query"
import { fetchProduct } from "@/services/products"

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id!),
    enabled: id !== undefined,
  })
}
