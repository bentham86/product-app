Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  # Documentación OpenAPI / Swagger UI (Spec docs/spec-API-Documentation-OpenAPI.md)
  get "api-docs/openapi.yaml", to: "api_docs#openapi"
  get "api-docs", to: redirect("/api-docs/index.html")

  namespace :api do
    namespace :v1 do
      resources :products
    end
  end
end
