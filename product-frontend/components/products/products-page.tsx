"use client"

import { useState, useCallback } from "react"
import { Plus, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProducts } from "@/hooks/use-products"
import { useDebounce } from "@/hooks/use-debounce"
import { ProductFilters } from "@/components/products/product-filters"
import { ProductTable } from "@/components/products/product-table"
import { ProductCardList } from "@/components/products/product-card-list"
import { ProductFormDialog } from "@/components/products/product-form-dialog"
import { DeleteConfirmDialog } from "@/components/products/delete-confirm-dialog"
import { AuditHistoryModal } from "@/components/products/audit-history-modal"
import { ProductPagination } from "@/components/products/product-pagination"
import { ProductEmptyState } from "@/components/products/product-empty-state"
import { ProductLoadingSkeleton } from "@/components/products/product-loading-skeleton"
import type { ProductListItem } from "@/types/product"

const PER_PAGE = 10

export function ProductsPage() {
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false)
  const [editProduct, setEditProduct] = useState<ProductListItem | null>(null)
  const [deleteProduct, setDeleteProduct] = useState<ProductListItem | null>(
    null
  )
  const [historyProduct, setHistoryProduct] = useState<ProductListItem | null>(
    null
  )

  const debouncedSearch = useDebounce(searchQuery, 300)

  const activeParam =
    activeFilter === "active"
      ? true
      : activeFilter === "inactive"
        ? false
        : null

  const { data, isLoading, isError, refetch } = useProducts({
    page,
    per_page: PER_PAGE,
    q: debouncedSearch || undefined,
    active: activeParam,
  })

  const hasFilters = !!debouncedSearch || activeFilter !== "all"
  const hasProducts = data && data.data.length > 0
  const isEmpty = data && data.data.length === 0

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
    setPage(1)
  }, [])

  const handleActiveFilterChange = useCallback((value: string) => {
    setActiveFilter(value)
    setPage(1)
  }, [])

  const handleCreateClick = useCallback(() => {
    setEditProduct(null)
    setFormDialogOpen(true)
  }, [])

  const handleEditClick = useCallback((product: ProductListItem) => {
    setEditProduct(product)
    setFormDialogOpen(true)
  }, [])

  const handleDeleteClick = useCallback((product: ProductListItem) => {
    setDeleteProduct(product)
    setDeleteDialogOpen(true)
  }, [])

  const handleHistoryClick = useCallback((product: ProductListItem) => {
    setHistoryProduct(product)
    setHistoryDialogOpen(true)
  }, [])

  const handleClearFilters = useCallback(() => {
    setSearchQuery("")
    setActiveFilter("all")
    setPage(1)
  }, [])

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            Products
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage your product catalog
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">New Product</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Filters */}
      <div className="mt-6">
        <ProductFilters
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          activeFilter={activeFilter}
          onActiveFilterChange={handleActiveFilterChange}
        />
      </div>

      {/* Content */}
      <div className="mt-6">
        {isLoading && <ProductLoadingSkeleton />}

        {isError && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-destructive/10 mb-4 flex size-12 items-center justify-center rounded-full">
              <AlertCircle className="text-destructive size-6" />
            </div>
            <h3 className="text-foreground text-lg font-semibold">
              Something went wrong
            </h3>
            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              We couldn&apos;t load the products. Please try again.
            </p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        )}

        {isEmpty && (
          <ProductEmptyState
            hasFilters={hasFilters}
            onCreateClick={handleCreateClick}
            onClearFilters={handleClearFilters}
          />
        )}

        {hasProducts && (
          <>
            <ProductTable
              products={data.data}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onHistory={handleHistoryClick}
            />
            <ProductCardList
              products={data.data}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onHistory={handleHistoryClick}
            />
          </>
        )}
      </div>

      {/* Pagination */}
      {data && data.meta.total_pages > 1 && (
        <div className="mt-6">
          <ProductPagination meta={data.meta} onPageChange={setPage} />
        </div>
      )}

      {/* Dialogs */}
      <ProductFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        editProduct={editProduct}
      />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        product={deleteProduct}
      />
      <AuditHistoryModal
        open={historyDialogOpen}
        onOpenChange={setHistoryDialogOpen}
        product={historyProduct}
      />
    </div>
  )
}
