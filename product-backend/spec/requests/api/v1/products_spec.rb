# frozen_string_literal: true

require "rails_helper"

RSpec.describe "Api::V1::Products", type: :request do
  let(:headers) { { "CONTENT_TYPE" => "application/json" } }

  describe "GET /api/v1/products" do
    it "returns empty data and meta when no products" do
      get "/api/v1/products", headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json).to have_key("data")
      expect(json).to have_key("meta")
      expect(json["data"]).to eq([])
      expect(json["meta"]["current_page"]).to eq(1)
      expect(json["meta"]["per_page"]).to be <= 10
    end

    it "returns list with :list view fields only" do
      product = create(:product, name: "Item", sku: "LST001", price: 10.50)
      get "/api/v1/products", headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"].size).to eq(1)
      item = json["data"].first
      expect(item).to have_key("id")
      expect(item).to have_key("name")
      expect(item).to have_key("price")
      expect(item).to have_key("sku")
      expect(item).to have_key("active")
      expect(item).not_to have_key("description")
      expect(item).not_to have_key("created_at")
      expect(item["name"]).to eq("Item")
      expect(item["sku"]).to eq("LST001")
    end

    it "filters by search param q" do
      create(:product, name: "Match This", sku: "M1")
      create(:product, name: "Other", sku: "M2")
      get "/api/v1/products", params: { q: "Match" }, headers: headers
      json = JSON.parse(response.body)
      expect(json["data"].size).to eq(1)
      expect(json["data"].first["name"]).to eq("Match This")
    end

    it "filters by active" do
      create(:product, active: true, sku: "A1")
      create(:product, active: false, sku: "A2")
      get "/api/v1/products", params: { active: "true" }, headers: headers
      json = JSON.parse(response.body)
      expect(json["data"].size).to eq(1)
      expect(json["data"].first["active"]).to eq(true)
    end
  end

  describe "GET /api/v1/products/:id" do
    it "returns product with full blueprint" do
      product = create(:product, name: "Detail", description: "Desc", sku: "D1")
      get "/api/v1/products/#{product.id}", headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["name"]).to eq("Detail")
      expect(json["data"]["description"]).to eq("Desc")
      expect(json["data"]).to have_key("created_at")
      expect(json["data"]).to have_key("updated_at")
    end

    it "returns 404 when product not found" do
      get "/api/v1/products/99999", headers: headers
      expect(response).to have_http_status(:not_found)
      json = JSON.parse(response.body)
      expect(json["error"]["code"]).to eq("not_found")
      expect(json["error"]["message"]).to eq("Product not found")
    end
  end

  describe "POST /api/v1/products" do
    it "creates product and returns 201 with data" do
      post "/api/v1/products", params: {
        name: "New Product",
        price: 29.99,
        stock: 3,
        sku: "NEW001",
        active: true
      }.to_json, headers: headers
      expect(response).to have_http_status(:created)
      json = JSON.parse(response.body)
      expect(json["data"]["name"]).to eq("New Product")
      expect(json["data"]["price"]).to eq("29.99")
      expect(json["data"]["sku"]).to eq("NEW001")
      expect(Product.count).to eq(1)
    end

    it "returns 422 with validation errors" do
      post "/api/v1/products", params: {
        name: "",
        price: -1,
        sku: "abc"
      }.to_json, headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
      json = JSON.parse(response.body)
      expect(json["error"]["code"]).to eq("validation_error")
      expect(json["error"]["details"]).to be_present
    end
  end

  describe "PUT /api/v1/products/:id" do
    it "updates product and returns 200 with data" do
      product = create(:product, name: "Old", sku: "U1")
      put "/api/v1/products/#{product.id}", params: {
        name: "Updated Name"
      }.to_json, headers: headers
      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json["data"]["name"]).to eq("Updated Name")
      expect(product.reload.name).to eq("Updated Name")
    end

    it "returns 404 when product not found" do
      put "/api/v1/products/99999", params: { name: "X" }.to_json, headers: headers
      expect(response).to have_http_status(:not_found)
    end

    it "returns 422 when validation fails" do
      product = create(:product, sku: "U2")
      put "/api/v1/products/#{product.id}", params: { price: -1 }.to_json, headers: headers
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe "DELETE /api/v1/products/:id" do
    it "deletes product and returns 204" do
      product = create(:product, sku: "D1")
      delete "/api/v1/products/#{product.id}", headers: headers
      expect(response).to have_http_status(:no_content)
      expect(Product.find_by(id: product.id)).to be_nil
    end

    it "returns 404 when product not found" do
      delete "/api/v1/products/99999", headers: headers
      expect(response).to have_http_status(:not_found)
    end
  end
end
