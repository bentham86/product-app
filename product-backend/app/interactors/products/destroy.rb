# frozen_string_literal: true

module Products
  class Destroy
    include Interactor

    def call
      context.product.update!(deleted_at: Time.current)
    end
  end
end
