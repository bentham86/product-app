# frozen_string_literal: true

module Products
  class Update
    include Interactor

    def call
      product = context.product
      if product.update(context.params.to_h)
        context.product = product
      else
        context.fail!(errors: product.errors.messages.to_h)
      end
    end
  end
end
