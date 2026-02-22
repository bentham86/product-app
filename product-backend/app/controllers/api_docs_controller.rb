# frozen_string_literal: true

# Sirve el documento OpenAPI (doc/openapi.yaml) para Swagger UI.
# La UI se sirve como estático desde public/api-docs/index.html.
class ApiDocsController < ActionController::API
  def openapi
    path = Rails.root.join("doc", "openapi.yaml")
    send_file path,
              type: "application/x-yaml",
              disposition: "inline",
              filename: "openapi.yaml"
  end
end
