# frozen_string_literal: true

require "rails_helper"

RSpec.describe ProductBlueprint do
  let(:product) do
    create(
      :product,
      name: "Test Product",
      description: "A description",
      price: 19.99,
      stock: 5,
      sku: "SKU001",
      active: true
    )
  end

  describe "default view" do
    let(:json) { JSON.parse(ProductBlueprint.render(product)) }

    it "includes id, name, description, price, stock, sku, active, created_at, updated_at" do
      expect(json).to have_key("id")
      expect(json).to have_key("name")
      expect(json).to have_key("description")
      expect(json).to have_key("price")
      expect(json).to have_key("stock")
      expect(json).to have_key("sku")
      expect(json).to have_key("active")
      expect(json).to have_key("created_at")
      expect(json).to have_key("updated_at")
    end

    it "formats price with two decimals" do
      expect(json["price"]).to eq("19.99")
    end
  end

  describe ":list view" do
    let(:json) { JSON.parse(ProductBlueprint.render(product, view: :list)) }

    it "includes only id, name, price, sku, active" do
      expect(json.keys).to match_array(%w[id name price sku active])
    end

    it "excludes description, created_at, updated_at, stock" do
      expect(json).not_to have_key("description")
      expect(json).not_to have_key("created_at")
      expect(json).not_to have_key("updated_at")
      expect(json).not_to have_key("stock")
    end

    it "formats price with two decimals" do
      expect(json["price"]).to eq("19.99")
    end
  end
end
