"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import {
  productSchema,
  type ProductFormValues,
} from "@/lib/validations/product-schema"
import { useProduct } from "@/hooks/use-product"
import {
  useCreateProduct,
  useUpdateProduct,
} from "@/hooks/use-product-mutations"
import type { ApiError, ProductListItem } from "@/types/product"

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editProduct?: ProductListItem | null
}

export function ProductFormDialog({
  open,
  onOpenChange,
  editProduct,
}: ProductFormDialogProps) {
  const isEditing = !!editProduct
  const { data: fullProduct, isLoading: isLoadingProduct } = useProduct(
    editProduct?.id
  )

  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const isPending = createMutation.isPending || updateMutation.isPending

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      stock: 0,
      sku: "",
      active: true,
    },
  })

  // Reset form when dialog opens/closes or product changes
  useEffect(() => {
    if (open && isEditing && fullProduct) {
      form.reset({
        name: fullProduct.name,
        description: fullProduct.description ?? "",
        price: parseFloat(fullProduct.price),
        stock: fullProduct.stock,
        sku: fullProduct.sku,
        active: fullProduct.active,
      })
    } else if (open && !isEditing) {
      form.reset({
        name: "",
        description: "",
        price: 0,
        stock: 0,
        sku: "",
        active: true,
      })
    }
  }, [open, isEditing, fullProduct, form])

  async function onSubmit(values: ProductFormValues) {
    try {
      if (isEditing && editProduct) {
        await updateMutation.mutateAsync({
          id: editProduct.id,
          input: {
            name: values.name,
            description: values.description || undefined,
            price: values.price,
            stock: values.stock,
            sku: values.sku,
            active: values.active,
          },
        })
      } else {
        await createMutation.mutateAsync({
          name: values.name,
          description: values.description || undefined,
          price: values.price,
          stock: values.stock,
          sku: values.sku,
          active: values.active,
        })
      }
      onOpenChange(false)
    } catch (err) {
      const apiError = err as ApiError
      if (apiError?.error?.details) {
        Object.entries(apiError.error.details).forEach(([field, messages]) => {
          form.setError(field as keyof ProductFormValues, {
            type: "server",
            message: messages.join(", "),
          })
        })
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Product" : "Create Product"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the product details below."
              : "Fill in the details to create a new product."}
          </DialogDescription>
        </DialogHeader>

        {isEditing && isLoadingProduct ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-muted-foreground size-6 animate-spin" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Product name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Product description (optional)"
                        className="min-h-[80px] resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          min="0"
                          placeholder="0"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. ABC123"
                        {...field}
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                        className="font-mono uppercase"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel className="text-sm font-medium">
                        Active
                      </FormLabel>
                      <p className="text-muted-foreground text-xs">
                        Make this product visible and available
                      </p>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {isEditing ? "Save Changes" : "Create Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
