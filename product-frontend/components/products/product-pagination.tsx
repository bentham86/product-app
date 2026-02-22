"use client"

import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react"
import type { PaginationMeta } from "@/types/product"

interface ProductPaginationProps {
  meta: PaginationMeta
  onPageChange: (page: number) => void
}

export function ProductPagination({
  meta,
  onPageChange,
}: ProductPaginationProps) {
  const { current_page, total_pages, total_count, per_page } = meta

  if (total_pages <= 1) return null

  const startItem = (current_page - 1) * per_page + 1
  const endItem = Math.min(current_page * per_page, total_count)

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-muted-foreground text-sm">
        Showing {startItem}-{endItem} of {total_count} products
      </p>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(1)}
          disabled={current_page <= 1}
          aria-label="First page"
        >
          <ChevronsLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" />
        </Button>

        <div className="flex items-center gap-1 px-2">
          {generatePageNumbers(current_page, total_pages).map((pageNum, i) =>
            pageNum === null ? (
              <span
                key={`ellipsis-${i}`}
                className="text-muted-foreground px-1 text-sm"
              >
                ...
              </span>
            ) : (
              <Button
                key={pageNum}
                variant={pageNum === current_page ? "default" : "outline"}
                size="icon-sm"
                onClick={() => onPageChange(pageNum)}
                aria-label={`Page ${pageNum}`}
                aria-current={pageNum === current_page ? "page" : undefined}
              >
                {pageNum}
              </Button>
            )
          )}
        </div>

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page >= total_pages}
          aria-label="Next page"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(total_pages)}
          disabled={current_page >= total_pages}
          aria-label="Last page"
        >
          <ChevronsRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function generatePageNumbers(
  current: number,
  total: number
): (number | null)[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | null)[] = [1]

  if (current > 3) {
    pages.push(null)
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push(null)
  }

  pages.push(total)

  return pages
}
