# product-app (product-backend)

API REST para gestión de productos (CRUD con búsqueda, filtrado y paginación). Desarrollada según **Spec Driven Development** — ver `docs/Spec-product-backend.md`.

## Stack

- Ruby on Rails (modo API)
- PostgreSQL
- Docker & Docker Compose

## Guía de configuración (Docker) — pasos de la Spec

1. **Requisitos:** Docker y Docker Compose instalados.

2. **Clonar/ubicar el proyecto** en este directorio.

3. **Build de la imagen:**
   ```bash
   docker compose build
   ```

4. **Crear base de datos y migraciones** (si el comando del paso 6 no lo hace automáticamente):
   ```bash
   docker compose run --rm app bundle exec rails db:create db:migrate
   ```
   Para test:
   ```bash
   docker compose run --rm app bundle exec rails db:test:prepare
   ```

5. **Levantar servicios:**
   ```bash
   docker compose up
   ```
   La API quedará en **http://localhost:3000**.

6. **Verificación:**
   ```bash
   curl http://localhost:3000/api/v1/products
   ```

7. **Tests:**
   ```bash
   docker compose run --rm app bundle exec rspec
   ```

## Documentación de API (OpenAPI / Swagger UI)

- **Swagger UI:** http://localhost:3000/api-docs (con la app levantada).
- **Spec OpenAPI:** `doc/openapi.yaml` (fuente de verdad); servido en `/api-docs/openapi.yaml`.
- Spec de implementación: `docs/spec-API-Documentation-OpenAPI.md` (en la raíz del repo).

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/products | Listado (q, active, page, per_page) |
| GET | /api/v1/products/:id | Detalle |
| POST | /api/v1/products | Crear |
| PUT | /api/v1/products/:id | Actualizar |
| DELETE | /api/v1/products/:id | Eliminar |

## Estructura relevante

- `app/blueprints/` — ProductBlueprint (vistas :default y :list)
- `app/interactors/products/` — Create, Update, Destroy
- `app/controllers/api/v1/products_controller.rb`
- `config/routes.rb` — namespace api/v1

## Sin Docker (local)

Si tienes PostgreSQL en local, crea las bases y ejecuta migraciones:

```bash
bundle install
rails db:create db:migrate
rails server
```

Para tests: `bundle exec rspec`.
