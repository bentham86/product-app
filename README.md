# product-app

Repositorio del proyecto product-app.

## Estructura

- **`docs/`** — Documentación y especificaciones (SDD).
- **`product-backend/`** — API REST de gestión de productos (Ruby on Rails, PostgreSQL, Docker). Ver `product-backend/README.md` para levantar el backend y ejecutar tests.

## Cómo levantar el backend

```bash
cd product-backend
docker compose build
docker compose up
```

API en http://localhost:3000. Endpoints bajo `/api/v1/products`. Documentación interactiva (Swagger UI) en http://localhost:3000/api-docs.
