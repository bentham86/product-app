# frozen_string_literal: true

module Api
  module V1
    class ProductsController < ApplicationController
      before_action :set_product, only: %i[show update destroy]

      def index
        relation = Product.without_deleted
        relation = relation.where("name ILIKE ?", "%#{params[:q]}%") if params[:q].present?
        relation = relation.where(active: params[:active]) if params[:active].present?
        per_page = [[(params[:per_page].presence || 10).to_i, 100].min, 1].max
        pagy, products = pagy(relation, items: per_page)
        meta = { current_page: pagy.page, per_page: pagy.items, total_pages: pagy.pages, total_count: pagy.count }
        render json: { data: blueprint_list(products), meta: meta }
      end

      def show
        render json: { data: blueprint_single(@product) }
      end

      def create
        result = Products::Create.call(params: product_params)
        if result.success?
          render json: { data: blueprint_single(result.product) }, status: :created
        else
          render json: error_response("validation_error", "Validation failed", result.errors), status: :unprocessable_entity
        end
      end

      def update
        result = Products::Update.call(product: @product, params: product_params)
        if result.success?
          render json: { data: blueprint_single(result.product) }
        else
          render json: error_response("validation_error", "Validation failed", result.errors), status: :unprocessable_entity
        end
      end

      def destroy
        Products::Destroy.call(product: @product)
        head :no_content
      end

      private

      def set_product
        @product = Product.without_deleted.find_by(id: params[:id])
        unless @product
          render json: { error: { code: "not_found", message: "Product not found" } }, status: :not_found
          return
        end
      end

      def product_params
        params.permit(:name, :description, :price, :stock, :sku, :active)
      end

      def blueprint_single(product)
        JSON.parse(ProductBlueprint.render(product))
      end

      def blueprint_list(products)
        JSON.parse(ProductBlueprint.render(products, view: :list))
      end

      def error_response(code, message, details = nil)
        h = { error: { code: code, message: message } }
        if details.present?
          h[:error][:details] = details.transform_keys(&:to_s)
        end
        h
      end
    end
  end
end
