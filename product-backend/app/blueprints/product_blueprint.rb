# frozen_string_literal: true

class ProductBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :description, :stock, :sku, :active, :created_at, :updated_at

  field :price do |product|
    format("%.2f", product.price)
  end

  view :list do
    fields :name, :price, :sku, :active
  end
end
