import { z } from "zod"

export const productSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must be at most 100 characters"),
  description: z
    .string()
    .max(1000, "Description must be at most 1000 characters")
    .optional()
    .or(z.literal("")),
  price: z.coerce
    .number({ invalid_type_error: "Price must be a number" })
    .positive("Price must be greater than 0"),
  stock: z.coerce
    .number({ invalid_type_error: "Stock must be a number" })
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative"),
  sku: z
    .string()
    .min(1, "SKU is required")
    .regex(/^[A-Z0-9]+$/, "SKU must be uppercase letters and numbers only")
    .transform((val) => val.toUpperCase()),
  active: z.boolean().default(true),
})

export type ProductFormValues = z.infer<typeof productSchema>
