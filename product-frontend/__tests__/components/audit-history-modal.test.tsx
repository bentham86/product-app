/**
 * Tests for AuditHistoryModal (Spec §9.1: audit history modal, states).
 */
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { AuditHistoryModal } from "@/components/products/audit-history-modal"
import { renderWithProviders } from "../test-utils"
import {
  fixtureProductListItem,
  fixtureProductAuditListResponse,
  fixtureEmptyAuditListResponse,
} from "../fixtures/products"

const mockOnOpenChange = jest.fn()
const mockRefetch = jest.fn()

let mockUseProductAuditsReturn: {
  data?: typeof fixtureProductAuditListResponse
  isLoading?: boolean
  isError?: boolean
  refetch: () => void
} = {
  data: fixtureProductAuditListResponse,
  isLoading: false,
  isError: false,
  refetch: mockRefetch,
}

jest.mock("@/hooks/use-product-audits", () => ({
  useProductAudits: () => mockUseProductAuditsReturn,
}))

describe("AuditHistoryModal", () => {
  beforeEach(() => {
    mockOnOpenChange.mockClear()
    mockRefetch.mockClear()
    mockUseProductAuditsReturn = {
      data: fixtureProductAuditListResponse,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    }
  })

  it("when open shows title with product name and description", () => {
    renderWithProviders(
      <AuditHistoryModal
        open={true}
        onOpenChange={mockOnOpenChange}
        product={fixtureProductListItem}
      />
    )

    expect(
      screen.getByRole("heading", { name: /history:\s*test product/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/recorded changes for this product/i)
    ).toBeInTheDocument()
  })

  it("when open with null product shows History title without name", () => {
    renderWithProviders(
      <AuditHistoryModal
        open={true}
        onOpenChange={mockOnOpenChange}
        product={null}
      />
    )

    expect(screen.getByRole("heading", { name: /^history$/i })).toBeInTheDocument()
  })

  it("when loading shows spinner", () => {
    mockUseProductAuditsReturn = {
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockRefetch,
    }

    renderWithProviders(
      <AuditHistoryModal
        open={true}
        onOpenChange={mockOnOpenChange}
        product={fixtureProductListItem}
      />
    )

    const spinner = document.querySelector(".animate-spin")
    expect(spinner).toBeInTheDocument()
  })

  it("when data is empty shows No changes recorded", () => {
    mockUseProductAuditsReturn = {
      data: fixtureEmptyAuditListResponse,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    }

    renderWithProviders(
      <AuditHistoryModal
        open={true}
        onOpenChange={mockOnOpenChange}
        product={fixtureProductListItem}
      />
    )

    expect(screen.getByText(/no changes recorded/i)).toBeInTheDocument()
  })

  it("when error shows message and Retry button", () => {
    mockUseProductAuditsReturn = {
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    }

    renderWithProviders(
      <AuditHistoryModal
        open={true}
        onOpenChange={mockOnOpenChange}
        product={fixtureProductListItem}
      />
    )

    expect(screen.getByText(/could not load history/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument()
  })

  it("calls refetch when Retry is clicked", async () => {
    const user = userEvent.setup()
    mockUseProductAuditsReturn = {
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockRefetch,
    }

    renderWithProviders(
      <AuditHistoryModal
        open={true}
        onOpenChange={mockOnOpenChange}
        product={fixtureProductListItem}
      />
    )

    await user.click(screen.getByRole("button", { name: /retry/i }))

    expect(mockRefetch).toHaveBeenCalledTimes(1)
  })

  it("when data has audits shows table with Action, Changes, Date columns", () => {
    renderWithProviders(
      <AuditHistoryModal
        open={true}
        onOpenChange={mockOnOpenChange}
        product={fixtureProductListItem}
      />
    )

    expect(screen.getByRole("columnheader", { name: /action/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /changes/i })).toBeInTheDocument()
    expect(screen.getByRole("columnheader", { name: /date/i })).toBeInTheDocument()

    expect(screen.getByText("Create")).toBeInTheDocument()
    expect(screen.getByText(/name:\s*Product E/i)).toBeInTheDocument()
    expect(screen.getByText(/sku:\s*SKU006/i)).toBeInTheDocument()
  })
})
