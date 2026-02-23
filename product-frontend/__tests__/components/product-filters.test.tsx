/**
 * Tests for ProductFilters (Spec §9.1: search input, filter select).
 */
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { ProductFilters } from "@/components/products/product-filters"
import { renderWithProviders } from "../test-utils"

const defaultProps = {
  searchQuery: "",
  onSearchChange: jest.fn(),
  activeFilter: "all",
  onActiveFilterChange: jest.fn(),
}

function renderFilters(props = {}) {
  return renderWithProviders(
    <ProductFilters {...defaultProps} {...props} />
  )
}

describe("ProductFilters", () => {
  beforeEach(() => {
    defaultProps.onSearchChange.mockClear()
    defaultProps.onActiveFilterChange.mockClear()
  })

  it("renders search input and filter select", () => {
    renderFilters()

    expect(
      screen.getByPlaceholderText(/search by name/i)
    ).toBeInTheDocument()
    expect(screen.getByRole("combobox")).toBeInTheDocument()
  })

  it("calls onSearchChange when typing in search", async () => {
    const user = userEvent.setup()
    renderFilters()

    const input = screen.getByPlaceholderText(/search by name/i)
    await user.type(input, "test")

    expect(defaultProps.onSearchChange).toHaveBeenCalled()
  })

  it("displays current search value", () => {
    renderFilters({ searchQuery: "widget" })

    const input = screen.getByPlaceholderText(/search by name/i)
    expect(input).toHaveValue("widget")
  })

  it("shows filter select with default value", () => {
    renderFilters()

    const combobox = screen.getByRole("combobox")
    expect(combobox).toBeInTheDocument()
    expect(combobox).toHaveTextContent(/all products/i)
  })
})
