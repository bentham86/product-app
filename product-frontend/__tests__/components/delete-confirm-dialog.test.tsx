/**
 * Tests for DeleteConfirmDialog (Spec §9.1: confirmation flow).
 */
import { screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DeleteConfirmDialog } from "@/components/products/delete-confirm-dialog"
import { renderWithProviders } from "../test-utils"
import { fixtureProductListItem } from "../fixtures/products"

const mockMutateAsync = jest.fn()
const mockOnOpenChange = jest.fn()

jest.mock("@/hooks/use-product-mutations", () => ({
  useDeleteProduct: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

describe("DeleteConfirmDialog", () => {
  beforeEach(() => {
    mockMutateAsync.mockReset()
    mockOnOpenChange.mockClear()
  })

  it("when open shows product name and Cancel / Delete buttons", async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <DeleteConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        product={fixtureProductListItem}
      />
    )

    expect(
      screen.getByRole("heading", { name: /delete product/i })
    ).toBeInTheDocument()
    expect(
      screen.getByText(/are you sure you want to delete/i)
    ).toBeInTheDocument()
    expect(screen.getByText(fixtureProductListItem.name)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /^delete$/i })).toBeInTheDocument()
  })

  it("calls delete mutation and closes on Delete click", async () => {
    const user = userEvent.setup()
    mockMutateAsync.mockResolvedValueOnce(undefined)

    renderWithProviders(
      <DeleteConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        product={fixtureProductListItem}
      />
    )

    await user.click(screen.getByRole("button", { name: /^delete$/i }))

    await expect(mockMutateAsync).toHaveBeenCalledWith(fixtureProductListItem.id)
    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
  })

  it("calls onOpenChange(false) when Cancel is clicked", async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <DeleteConfirmDialog
        open={true}
        onOpenChange={mockOnOpenChange}
        product={fixtureProductListItem}
      />
    )

    await user.click(screen.getByRole("button", { name: /cancel/i }))

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    expect(mockMutateAsync).not.toHaveBeenCalled()
  })
})
