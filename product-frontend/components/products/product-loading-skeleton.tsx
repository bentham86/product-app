"use client"

import { Skeleton } from "@/components/ui/skeleton"

export function ProductLoadingSkeleton() {
  return (
    <>
      {/* Desktop table skeleton */}
      <div className="hidden md:block">
        <div className="rounded-lg border">
          <div className="bg-muted/50 flex items-center border-b px-4 py-3">
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="ml-auto h-4 w-[60px]" />
            <Skeleton className="ml-8 h-4 w-[50px]" />
            <Skeleton className="ml-8 h-4 w-[50px]" />
            <Skeleton className="ml-8 h-4 w-[30px]" />
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center border-b px-4 py-3 last:border-b-0"
            >
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="ml-auto h-5 w-[70px]" />
              <Skeleton className="ml-8 h-4 w-[60px]" />
              <Skeleton className="ml-8 h-5 w-[55px]" />
              <Skeleton className="ml-8 size-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>

      {/* Mobile card skeleton */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <Skeleton className="h-5 w-[150px]" />
                <div className="mt-2 flex items-center gap-2">
                  <Skeleton className="h-5 w-[70px]" />
                  <Skeleton className="h-5 w-[55px]" />
                </div>
              </div>
              <Skeleton className="size-8 rounded-md" />
            </div>
            <Skeleton className="mt-3 h-6 w-[80px]" />
          </div>
        ))}
      </div>
    </>
  )
}
