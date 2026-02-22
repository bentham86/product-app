# frozen_string_literal: true

module Products
  class Create
    include Interactor

    def call
      product = Product.new(context.params.to_h)
      if product.save
        context.product = product
      else
        context.fail!(errors: product.errors.messages.to_h)
      end
    end
  end
end
