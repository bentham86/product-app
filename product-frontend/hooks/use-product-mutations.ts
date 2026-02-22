import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createProduct, updateProduct, deleteProduct } from "@/services/products"
import type { ProductInput, ApiError } from "@/types/product"
import { toast } from "sonner"

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product created successfully")
    },
    onError: (error: ApiError) => {
      if (error?.error?.code !== "validation_error") {
        toast.error(error?.error?.message ?? "Failed to create product")
      }
    },
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<ProductInput> }) =>
      updateProduct(id, input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["product", variables.id] })
      toast.success("Product updated successfully")
    },
    onError: (error: ApiError) => {
      if (error?.error?.code !== "validation_error") {
        toast.error(error?.error?.message ?? "Failed to update product")
      }
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast.success("Product deleted successfully")
    },
    onError: (error: ApiError) => {
      toast.error(error?.error?.message ?? "Failed to delete product")
    },
  })
}
