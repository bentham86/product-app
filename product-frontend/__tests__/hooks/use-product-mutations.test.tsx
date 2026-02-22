/**
 * Tests for useCreateProduct, useUpdateProduct, useDeleteProduct (Spec §9.1).
 */
import { renderHook, waitFor } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import type { ReactNode } from "react"
import {
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/use-product-mutations"
import { fixtureProduct, fixtureProductInput } from "../fixtures/products"

const mockCreateProduct = jest.fn()
const mockUpdateProduct = jest.fn()
const mockDeleteProduct = jest.fn()
const mockToastSuccess = jest.fn()
const mockToastError = jest.fn()

jest.mock("@/services/products", () => ({
  createProduct: (...args: unknown[]) => mockCreateProduct(...args),
  updateProduct: (...args: unknown[]) => mockUpdateProduct(...args),
  deleteProduct: (...args: unknown[]) => mockDeleteProduct(...args),
}))

jest.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false } },
  })
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe("useCreateProduct", () => {
  beforeEach(() => {
    mockCreateProduct.mockReset()
    mockToastSuccess.mockClear()
    mockToastError.mockClear()
  })

  it("calls createProduct with input and shows success toast on success", async () => {
    mockCreateProduct.mockResolvedValueOnce(fixtureProduct)

    const { result } = renderHook(() => useCreateProduct(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(fixtureProductInput)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockCreateProduct).toHaveBeenCalledWith(fixtureProductInput)
    expect(mockToastSuccess).toHaveBeenCalledWith("Product created successfully")
  })

  it("shows error toast on failure (non-validation)", async () => {
    mockCreateProduct.mockRejectedValueOnce({
      error: { code: "internal_error", message: "Server error" },
    })

    const { result } = renderHook(() => useCreateProduct(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(fixtureProductInput)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(mockToastError).toHaveBeenCalledWith("Server error")
  })
})

describe("useUpdateProduct", () => {
  beforeEach(() => {
    mockUpdateProduct.mockReset()
    mockToastSuccess.mockClear()
  })

  it("calls updateProduct with id and input and shows success toast", async () => {
    mockUpdateProduct.mockResolvedValueOnce({
      ...fixtureProduct,
      name: "Updated",
    })

    const { result } = renderHook(() => useUpdateProduct(), {
      wrapper: createWrapper(),
    })

    result.current.mutate({ id: 1, input: { name: "Updated" } })

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockUpdateProduct).toHaveBeenCalledWith(1, { name: "Updated" })
    expect(mockToastSuccess).toHaveBeenCalledWith("Product updated successfully")
  })
})

describe("useDeleteProduct", () => {
  beforeEach(() => {
    mockDeleteProduct.mockReset()
    mockToastSuccess.mockClear()
    mockToastError.mockClear()
  })

  it("calls deleteProduct and shows success toast on 204", async () => {
    mockDeleteProduct.mockResolvedValueOnce(undefined)

    const { result } = renderHook(() => useDeleteProduct(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(1)

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })

    expect(mockDeleteProduct).toHaveBeenCalledWith(1)
    expect(mockToastSuccess).toHaveBeenCalledWith("Product deleted successfully")
  })

  it("shows error toast on delete failure", async () => {
    mockDeleteProduct.mockRejectedValueOnce({
      error: { code: "not_found", message: "Product not found" },
    })

    const { result } = renderHook(() => useDeleteProduct(), {
      wrapper: createWrapper(),
    })

    result.current.mutate(999)

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(mockToastError).toHaveBeenCalledWith("Product not found")
  })
})
