"use client"

import { Package, SearchX } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductEmptyStateProps {
  hasFilters: boolean
  onCreateClick: () => void
  onClearFilters: () => void
}

export function ProductEmptyState({
  hasFilters,
  onCreateClick,
  onClearFilters,
}: ProductEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-full">
          <SearchX className="text-muted-foreground size-6" />
        </div>
        <h3 className="text-foreground text-lg font-semibold">
          No products found
        </h3>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          No products match your current search or filter criteria. Try
          adjusting your filters.
        </p>
        <Button variant="outline" className="mt-4" onClick={onClearFilters}>
          Clear Filters
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="bg-muted mb-4 flex size-12 items-center justify-center rounded-full">
        <Package className="text-muted-foreground size-6" />
      </div>
      <h3 className="text-foreground text-lg font-semibold">No products yet</h3>
      <p className="text-muted-foreground mt-1 max-w-sm text-sm">
        Get started by creating your first product. Products you add will appear
        here.
      </p>
      <Button className="mt-4" onClick={onCreateClick}>
        Create Your First Product
      </Button>
    </div>
  )
}
