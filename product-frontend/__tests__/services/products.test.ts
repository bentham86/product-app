/**
 * Tests for products service (Spec §9.1: URL, body, response parsing).
 * Mock fetch and config; no real API.
 */
const BASE_URL = "http://test"

jest.mock("@/lib/config", () => ({
  config: {
    api: { baseUrl: "http://test", useMock: false, timeout: 10000 },
    pagination: { defaultPerPage: 10 },
    mock: { delay: 0 },
  },
}))

import {
  fetchProducts,
  fetchProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  fetchProductAudits,
} from "@/services/products"
import {
  fixtureProduct,
  fixtureProductListResponse,
  fixtureProductInput,
  fixtureProductAuditListResponse,
} from "../fixtures/products"

describe("products service", () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  describe("fetchProducts", () => {
    it("builds URL with query params (page, per_page, q, active)", async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fixtureProductListResponse),
      })

      await fetchProducts({
        page: 2,
        per_page: 5,
        q: "test",
        active: true,
      })

      expect(global.fetch).toHaveBeenCalledTimes(1)
      const [url] = (global.fetch as jest.Mock).mock.calls[0]
      expect(url).toBe(
        `${BASE_URL}/api/v1/products?page=2&per_page=5&q=test&active=true`
      )
    })

    it("returns parsed ProductListResponse", async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fixtureProductListResponse),
      })

      const result = await fetchProducts({ page: 1 })

      expect(result).toEqual(fixtureProductListResponse)
      expect(result.data).toHaveLength(1)
      expect(result.meta.current_page).toBe(1)
    })

    it("throws on network/API error", async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () =>
          Promise.resolve({
            error: { code: "internal_error", message: "Server error" },
          }),
      })

      await expect(fetchProducts({})).rejects.toMatchObject({
        error: { code: "internal_error", message: "Server error" },
      })
    })
  })

  describe("fetchProduct", () => {
    it("builds URL for single product and returns Product", async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: fixtureProduct }),
      })

      const result = await fetchProduct(1)

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/products/1`,
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
          }),
        })
      )
      expect(result).toEqual(fixtureProduct)
    })

    it("throws on 404", async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            error: { code: "not_found", message: "Product not found" },
          }),
      })

      await expect(fetchProduct(999)).rejects.toMatchObject({
        error: { code: "not_found" },
      })
    })
  })

  describe("createProduct", () => {
    it("sends flat JSON body (no product wrapper) and parses response", async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ data: fixtureProduct }),
      })

      const result = await createProduct(fixtureProductInput)

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/products`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(fixtureProductInput),
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      )
      expect(result).toEqual(fixtureProduct)
    })
  })

  describe("updateProduct", () => {
    it("sends flat JSON body and correct URL", async () => {
      const partial = { name: "Updated Name", price: 39.99 }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () =>
          Promise.resolve({
            data: { ...fixtureProduct, ...partial },
          }),
      })

      await updateProduct(1, partial)

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/products/1`,
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(partial),
        })
      )
    })
  })

  describe("deleteProduct", () => {
    it("calls DELETE with correct URL and handles 204", async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      })

      await deleteProduct(1)

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/products/1`,
        expect.objectContaining({ method: "DELETE" })
      )
    })

    it("throws on 404", async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            error: { code: "not_found", message: "Product not found" },
          }),
      })

      await expect(deleteProduct(999)).rejects.toMatchObject({
        error: { code: "not_found" },
      })
    })
  })

  describe("fetchProductAudits", () => {
    it("builds URL with product id and returns ProductAuditListResponse", async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(fixtureProductAuditListResponse),
      })

      const result = await fetchProductAudits(5)

      expect(global.fetch).toHaveBeenCalledWith(
        `${BASE_URL}/api/v1/products/5/audits`,
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
          }),
        })
      )
      expect(result).toEqual(fixtureProductAuditListResponse)
      expect(result.data).toHaveLength(1)
      expect(result.data[0].action).toBe("create")
      expect(result.data[0].changes).toHaveProperty("name", "Product E")
    })

    it("returns empty data array when API returns no audits", async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: [] }),
      })

      const result = await fetchProductAudits(1)

      expect(result.data).toEqual([])
    })

    it("throws on 404 when product does not exist", async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: () =>
          Promise.resolve({
            error: { code: "not_found", message: "Product not found" },
          }),
      })

      await expect(fetchProductAudits(999)).rejects.toMatchObject({
        error: { code: "not_found" },
      })
    })
  })
})
