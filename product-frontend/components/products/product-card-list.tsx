"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Pencil, Trash2, History } from "lucide-react"
import type { ProductListItem } from "@/types/product"

interface ProductCardListProps {
  products: ProductListItem[]
  onEdit: (product: ProductListItem) => void
  onDelete: (product: ProductListItem) => void
  onHistory: (product: ProductListItem) => void
}

export function ProductCardList({
  products,
  onEdit,
  onDelete,
  onHistory,
}: ProductCardListProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
      {products.map((product) => (
        <Card key={product.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium">{product.name}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <code className="bg-muted rounded px-1.5 py-0.5 text-xs font-mono">
                    {product.sku}
                  </code>
                  <Badge
                    variant={product.active ? "default" : "secondary"}
                    className={
                      product.active
                        ? "bg-emerald-600 text-white hover:bg-emerald-600/90"
                        : ""
                    }
                  >
                    {product.active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="shrink-0">
                    <MoreHorizontal className="size-4" />
                    <span className="sr-only">Open actions menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit(product)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onHistory(product)}>
                    <History className="size-4" />
                    History
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(product)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-foreground mt-3 text-lg font-semibold">
              {"$"}{parseFloat(product.price).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
