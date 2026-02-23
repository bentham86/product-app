/**
 * Tests for useProductAudits (Spec §9.1 / audit history).
 */
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useProductAudits } from "@/hooks/use-product-audits"
import { fixtureProductAuditListResponse } from "../fixtures/products"

const mockFetchProductAudits = jest.fn()

jest.mock("@/services/products", () => ({
  fetchProductAudits: (...args: unknown[]) => mockFetchProductAudits(...args),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe("useProductAudits", () => {
  beforeEach(() => {
    mockFetchProductAudits.mockReset()
  })

  it("does not fetch when productId is undefined", () => {
    const { result } = renderHook(() => useProductAudits(undefined), {
      wrapper: createWrapper(),
    })

    expect(mockFetchProductAudits).not.toHaveBeenCalled()
    expect(result.current.isFetching).toBe(false)
  })

  it("fetches audits when productId is provided and returns data", async () => {
    mockFetchProductAudits.mockResolvedValueOnce(fixtureProductAuditListResponse)

    const { result } = renderHook(() => useProductAudits(7), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFetchProductAudits).toHaveBeenCalledWith(7)
    expect(result.current.data).toEqual(fixtureProductAuditListResponse)
    expect(result.current.data?.data).toHaveLength(1)
    expect(result.current.data?.data[0].action).toBe("create")
  })

  it("sets isError when fetch fails", async () => {
    mockFetchProductAudits.mockRejectedValueOnce(
      new Error("Network error")
    )

    const { result } = renderHook(() => useProductAudits(1), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(mockFetchProductAudits).toHaveBeenCalledWith(1)
    expect(result.current.error).toBeDefined()
  })

  it("exposes refetch for retry", async () => {
    mockFetchProductAudits.mockResolvedValueOnce(fixtureProductAuditListResponse)

    const { result } = renderHook(() => useProductAudits(1), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    mockFetchProductAudits.mockResolvedValueOnce(fixtureProductAuditListResponse)
    result.current.refetch()

    await waitFor(() => {
      expect(mockFetchProductAudits).toHaveBeenCalledTimes(2)
    })
  })
})
