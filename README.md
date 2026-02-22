# product-app

Repositorio del proyecto product-app.

## Estructura

- **`docs/`** — Documentación y especificaciones (SDD).
- **`product-backend/`** — API REST de gestión de productos (Ruby on Rails, PostgreSQL, Docker). Ver `product-backend/README.md` para levantar el backend y ejecutar tests.
- **`product-frontend/`** — Panel de administración de productos (Next.js, React, TanStack Query). Ver `product-frontend/README.md` para instalación local, tests y deploy.

## Cómo levantar el backend

```bash
cd product-backend
docker compose build
docker compose up
```

API en http://localhost:3000. Endpoints bajo `/api/v1/products`. Documentación interactiva (Swagger UI) en http://localhost:3000/api-docs.

## Cómo levantar el frontend

```bash
cd product-frontend
npm install
cp .env.local.example .env.local
npm dev
```

App en http://localhost:3000. Sin `NEXT_PUBLIC_API_BASE_URL` arranca en modo mock; para conectar al backend local suele usarse `http://localhost:3001` (o el puerto del backend).
