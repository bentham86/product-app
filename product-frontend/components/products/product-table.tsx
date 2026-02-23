"use client"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

interface ProductTableProps {
  products: ProductListItem[]
  onEdit: (product: ProductListItem) => void
  onDelete: (product: ProductListItem) => void
  onHistory: (product: ProductListItem) => void
}

export function ProductTable({ products, onEdit, onDelete, onHistory }: ProductTableProps) {
  return (
    <div className="hidden md:block">
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="pl-4">Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[60px] pr-4">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="pl-4 font-medium">
                  {product.name}
                </TableCell>
                <TableCell>
                  <code className="bg-muted rounded px-1.5 py-0.5 text-xs font-mono">
                    {product.sku}
                  </code>
                </TableCell>
                <TableCell>
                  {"$"}{parseFloat(product.price).toFixed(2)}
                </TableCell>
                <TableCell>
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
                </TableCell>
                <TableCell className="pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
