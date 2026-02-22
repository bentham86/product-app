/**
 * Tests for useProducts hook (Spec §9.1: queryKey, fetchProducts, data/loading/error).
 */
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import { useProducts } from "@/hooks/use-products"
import { fixtureProductListResponse } from "../fixtures/products"

const mockFetchProducts = jest.fn()

jest.mock("@/services/products", () => ({
  fetchProducts: (...args: unknown[]) => mockFetchProducts(...args),
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

describe("useProducts", () => {
  beforeEach(() => {
    mockFetchProducts.mockReset()
  })

  it("calls fetchProducts with params and returns data on success", async () => {
    mockFetchProducts.mockResolvedValueOnce(fixtureProductListResponse)

    const { result } = renderHook(() => useProducts({ page: 1, per_page: 10 }), {
      wrapper: createWrapper(),
    })

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFetchProducts).toHaveBeenCalledWith({ page: 1, per_page: 10 })
    expect(result.current.data).toEqual(fixtureProductListResponse)
    expect(result.current.data?.data).toHaveLength(1)
  })

  it("includes q and active in query when provided", async () => {
    mockFetchProducts.mockResolvedValueOnce(fixtureProductListResponse)

    const { result } = renderHook(
      () => useProducts({ page: 1, q: "test", active: true }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockFetchProducts).toHaveBeenCalledWith({
      page: 1,
      q: "test",
      active: true,
    })
  })

  it("sets isError and error when fetch fails", async () => {
    const error = new Error("Network error")
    mockFetchProducts.mockRejectedValueOnce(error)

    const { result } = renderHook(() => useProducts({}), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.error).toBeDefined()
  })
})
