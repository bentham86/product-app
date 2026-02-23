"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useProductAudits } from "@/hooks/use-product-audits"
import type { ProductAuditChanges, ProductListItem } from "@/types/product"

interface AuditHistoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: ProductListItem | null
}

function formatChanges(changes: ProductAuditChanges): string {
  return Object.entries(changes)
    .map(([key, value]) => {
      const v =
        value === null
          ? "—"
          : typeof value === "boolean"
            ? value
              ? "true"
              : "false"
            : String(value)
      return `${key}: ${v}`
    })
    .join("\n")
}

function formatDate(createdAt: string): string {
  try {
    const d = new Date(createdAt)
    return d.toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    })
  } catch {
    return createdAt
  }
}

function actionLabel(action: string): string {
  const labels: Record<string, string> = {
    create: "Create",
    update: "Update",
    destroy: "Delete",
  }
  return labels[action] ?? action
}

export function AuditHistoryModal({
  open,
  onOpenChange,
  product,
}: AuditHistoryModalProps) {
  const productId = product?.id
  const { data, isLoading, isError, refetch } = useProductAudits(
    open ? productId : undefined
  )

  const audits = data?.data ?? []
  const isEmpty = !isLoading && !isError && audits.length === 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-4xl overflow-hidden flex flex-col"
        showCloseButton={true}
      >
        <DialogHeader>
          <DialogTitle>
            History{product ? `: ${product.name}` : ""}
          </DialogTitle>
          <DialogDescription>
            Recorded changes for this product (action and values at each point).
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-auto -mx-1 px-1">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground size-8 animate-spin" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-destructive/10 mb-4 flex size-12 items-center justify-center rounded-full">
                <AlertCircle className="text-destructive size-6" />
              </div>
              <p className="text-muted-foreground text-sm">
                Could not load history.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => refetch()}
              >
                <RefreshCw className="size-4" />
                Retry
              </Button>
            </div>
          )}

          {isEmpty && !isLoading && !isError && (
            <p className="text-muted-foreground py-12 text-center text-sm">
              No changes recorded.
            </p>
          )}

          {audits.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[100px]">Action</TableHead>
                    <TableHead>Changes</TableHead>
                    <TableHead className="w-[160px]">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {audits.map((audit) => (
                    <TableRow key={audit.id}>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {actionLabel(audit.action)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <pre className="text-muted-foreground whitespace-pre-wrap break-words font-sans text-xs">
                          {formatChanges(audit.changes)}
                        </pre>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(audit.created_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
