/**
 * Tests for ProductEmptyState (Spec §9.1: empty state, loading/empty).
 */
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ProductEmptyState } from "@/components/products/product-empty-state"
import { renderWithProviders } from "../test-utils"

describe("ProductEmptyState", () => {
  it("shows empty catalog message and Create button when no filters", async () => {
    const user = userEvent.setup()
    const onCreateClick = jest.fn()
    const onClearFilters = jest.fn()

    renderWithProviders(
      <ProductEmptyState
        hasFilters={false}
        onCreateClick={onCreateClick}
        onClearFilters={onClearFilters}
      />
    )

    expect(
      screen.getByRole("heading", { name: /no products yet/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /create your first product/i })
    ).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /clear filters/i })).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /create your first product/i }))
    expect(onCreateClick).toHaveBeenCalledTimes(1)
  })

  it("shows no results message and Clear Filters button when filters applied", async () => {
    const user = userEvent.setup()
    const onCreateClick = jest.fn()
    const onClearFilters = jest.fn()

    renderWithProviders(
      <ProductEmptyState
        hasFilters={true}
        onCreateClick={onCreateClick}
        onClearFilters={onClearFilters}
      />
    )

    expect(
      screen.getByRole("heading", { name: /no products found/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /clear filters/i })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /create your first product/i })
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /clear filters/i }))
    expect(onClearFilters).toHaveBeenCalledTimes(1)
  })
})
