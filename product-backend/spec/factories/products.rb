FactoryBot.define do
  factory :product do
    name { "Valid Product Name" }
    description { "Optional description" }
    price { 19.99 }
    stock { 10 }
    sequence(:sku) { |n| "SKU#{n.to_s.rjust(3, '0')}" }
    active { true }
  end
end
