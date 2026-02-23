# Aplicativo de Producto

Repositorio del proyecto **product-app**: aplicación de gestión de productos (catálogo CRUD) compuesta por un backend API y un frontend web. Ambos proyectos siguen **Spec Driven Development** — las especificaciones están en `docs/`.

## Descripción general

| Proyecto | Qué hace |
| -------- | -------- |
| **product-backend** | API REST (Ruby on Rails + PostgreSQL) que expone el recurso “productos”: listado con búsqueda, filtro por estado y paginación; detalle, creación, actualización y eliminación (soft delete). Sirve los datos en JSON y documenta el contrato con OpenAPI/Swagger. |
| **product-frontend** | Aplicación web (Next.js + React) que consume la API: pantalla de listado (tabla/tarjetas), búsqueda en tiempo real, filtros, paginación, formulario para crear/editar productos con validación, y flujo de eliminación con confirmación. Puede funcionar en modo mock (sin backend) para desarrollo. |

Juntos forman un flujo completo: el frontend llama al backend en `/api/v1/products`; la documentación de la API está en el backend y las especificaciones de diseño en `docs/` (SDD backend, frontend y API).

## Enlaces en producción

| Recurso | URL |
| -------- | -------- |
| **Frontend (Vercel)** | https://product-app-five-sigma.vercel.app/ |
| **Backend API base (Railway)** | https://product-app-production-e218.up.railway.app |
| **Documentación API (Swagger UI)** | https://product-app-production-e218.up.railway.app/api-docs |

Puedes usar el frontend para gestionar el catálogo; los endpoints se pueden probar desde Swagger o con `curl` (p. ej. `GET /api/v1/products`).

## CI/CD

En cada **push** y **pull request** a `main` se ejecuta un pipeline en GitHub Actions (`.github/workflows/ci.yml`):

- **Backend:** lint (RuboCop), tests (RSpec + PostgreSQL), seguridad (Brakeman, bundler-audit).
- **Frontend:** lint (ESLint), tests (Jest), build (Next.js).

Los jobs se ejecutan en paralelo. El build del frontend solo corre si lint y tests del frontend pasan.

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
pnpm install
cp .env.local.example .env.local
pnpm dev
```

App en http://localhost:3000. Sin `NEXT_PUBLIC_API_BASE_URL` arranca en modo mock; para conectar al backend local suele usarse `http://localhost:3001` (o el puerto del backend).

## Mejoras futuras

Ideas para ampliar el proyecto con más tiempo:

| Área | Mejora |
|------|--------|
| **Autenticación y autorización** | Login (JWT o sesiones), roles (admin/lector), protección de endpoints y rutas en el frontend. |
| **Rate limiting** | Límite de peticiones por IP o por usuario en el backend para evitar abuso. |
| **Tests E2E** | Flujos completos con Playwright o Cypress (crear producto, editar, ver historial, eliminar) contra frontend + API. |
| **Imágenes de productos** | Campo opcional para foto (almacenamiento en S3 o similar; Active Storage en Rails); vista previa en listado y formulario. |
| **Internacionalización (i18n)** | Soporte para varios idiomas en el frontend (y opcionalmente en mensajes de la API). |
| **Restaurar productos eliminados** | Endpoint y UI para “restore” de productos con soft delete (poner `deleted_at` en null). |
| **Filtros y ordenación** | Más filtros en el listado (por rango de precio, por SKU), ordenación por columna (nombre, precio, fecha). |
| **Exportar datos** | Exportar listado a CSV o Excel desde el frontend o vía endpoint. |
| **Monitoreo y alertas** | Health check explícito (`/health`), métricas (ej. Prometheus) y alertas si la API o el frontend caen. |
| **Paginación en historial** | Si un producto tiene muchos audits, paginar o limitar la respuesta de `GET /products/:id/audits`. |
| **Tema oscuro** | Toggle de tema claro/oscuro en el frontend (Tailwind dark mode ya facilita la base). |
