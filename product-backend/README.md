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

5. **Levantar servicios:**
   ```bash
   docker compose up
   ```
   La API quedará en **http://localhost:3000**.

6. **Verificación:**
   ```bash
   curl http://localhost:3000/api/v1/products
   ```

7. **Tests:** Los tests deben ejecutarse con `RAILS_ENV=test` y la base de test creada/migrada (el contenedor usa `development` por defecto). Desde este directorio (`product-backend`):
   ```bash
   docker compose run --rm -e RAILS_ENV=test -e POSTGRES_DB=product_app_test -e POSTGRES_DB_TEST=product_app_test app bash -c "bin/rails db:create db:migrate && bundle exec rspec"
   ```
   Ese comando crea la BD de test si no existe, aplica migraciones y ejecuta RSpec.

## Documentación de API (OpenAPI / Swagger UI)

- **Swagger UI:** http://localhost:3000/api-docs (con la app levantada).
- **Spec OpenAPI:** `doc/openapi.yaml` (fuente de verdad); servido en `/api-docs/openapi.yaml`.
- Spec de implementación: `docs/spec-API-Documentation-OpenAPI.md` (en la raíz del repo).

## Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /api/v1/products | Listado (q, active, page, per_page) |
| GET | /api/v1/products/:id | Detalle |
| GET | /api/v1/products/:id/audits | Historial de cambios (auditoría) |
| POST | /api/v1/products | Crear |
| PUT | /api/v1/products/:id | Actualizar |
| DELETE | /api/v1/products/:id | Eliminar (soft delete) |

## Trazabilidad de cambios

Los cambios en productos (create, update, soft delete) se registran con la gema **audited**. El endpoint `GET /api/v1/products/:id/audits` devuelve el historial ordenado por fecha (más reciente primero). Se puede consultar por id aunque el producto esté soft-deleted.

**Si al crear un producto obtienes 500 y en el log aparece ROLLBACK tras el INSERT:** suele deberse a que la tabla `audits` no existe. Ejecuta las migraciones (en Docker: `docker compose run --rm app bundle exec rails db:migrate`) o reinicia los contenedores para que el entrypoint ejecute las migraciones.

## Estructura relevante

- `app/blueprints/` — ProductBlueprint, AuditBlueprint
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
