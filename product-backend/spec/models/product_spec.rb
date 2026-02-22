# frozen_string_literal: true

require "rails_helper"

RSpec.describe Product, type: :model do
  describe "validations" do
    it "requires name" do
      product = build(:product, name: nil)
      expect(product).not_to be_valid
      expect(product.errors[:name]).to be_present
    end

    it "requires name length between 3 and 100" do
      expect(build(:product, name: "ab")).not_to be_valid
      expect(build(:product, name: "a" * 101)).not_to be_valid
      expect(build(:product, name: "abc")).to be_valid
    end

    it "allows description up to 1000 characters" do
      expect(build(:product, description: "a" * 1001)).not_to be_valid
      expect(build(:product, description: "a" * 1000)).to be_valid
      expect(build(:product, description: nil)).to be_valid
    end

    it "requires price greater than 0" do
      expect(build(:product, price: 0)).not_to be_valid
      expect(build(:product, price: -1)).not_to be_valid
      expect(build(:product, price: 0.01)).to be_valid
    end

    it "requires stock >= 0" do
      expect(build(:product, stock: -1)).not_to be_valid
      expect(build(:product, stock: 0)).to be_valid
    end

    it "requires unique sku" do
      create(:product, sku: "UNIQ1")
      expect(build(:product, sku: "UNIQ1")).not_to be_valid
    end

    it "rejects sku that is not alphanumeric uppercase" do
      product = build(:product, sku: "abc123")
      expect(product).not_to be_valid
      expect(product.errors[:sku]).to include("must be alphanumeric uppercase")
    end

    it "accepts sku that is alphanumeric uppercase" do
      product = build(:product, sku: "ABC123")
      expect(product).to be_valid
    end

    it "normalizes sku to uppercase" do
      product = create(:product, sku: "sku001")
      expect(product.sku).to eq("SKU001")
    end

    it "requires active to be boolean" do
      expect(build(:product, active: true)).to be_valid
      expect(build(:product, active: false)).to be_valid
    end
  end

  describe "scopes" do
    describe ".active" do
      it "returns only active products" do
        active_product = create(:product, active: true)
        _inactive = create(:product, active: false)
        expect(Product.active).to eq([active_product])
      end
    end

    describe ".without_deleted" do
      it "returns only products without deleted_at set" do
        visible = create(:product, sku: "S1")
        create(:product, sku: "S2", deleted_at: Time.current)
        expect(Product.without_deleted).to eq([visible])
      end
    end
  end
end
