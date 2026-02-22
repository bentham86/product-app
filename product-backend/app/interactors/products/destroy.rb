# frozen_string_literal: true

module Products
  class Destroy
    include Interactor

    def call
      context.product.destroy
    end
  end
end
