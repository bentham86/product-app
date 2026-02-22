# frozen_string_literal: true

class Product < ApplicationRecord
  before_validation :normalize_sku

  validates :name, presence: true, length: { minimum: 3, maximum: 100 }
  validates :description, length: { maximum: 1000 }, allow_blank: true
  validates :price, presence: true, numericality: { greater_than: 0 }
  validates :stock, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
  validates :sku, presence: true, uniqueness: true
  validate :sku_format
  validates :active, inclusion: { in: [true, false] }

  scope :active, -> { where(active: true) }

  private

  def sku_format
    return if sku.blank?
    return if sku.match?(/\A[A-Z0-9]+\z/)
    errors.add(:sku, "must be alphanumeric uppercase")
  end

  def normalize_sku
    self.sku = sku.to_s.upcase.strip if sku.present?
  end
end
