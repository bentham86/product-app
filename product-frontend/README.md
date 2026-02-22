# product-app (product-frontend)

Panel de administración de productos (CRUD con búsqueda, filtrado y paginación). Desarrollado según **Spec Driven Development** — ver `docs/Spec-product-frontend.md`.

## Stack

- Next.js 16 (App Router)
- React 19, TypeScript
- TanStack Query v5, React Hook Form + Zod
- Tailwind CSS v4, shadcn/ui (Radix), Sonner
- Jest + React Testing Library (tests)

## Guía de configuración (local)

1. **Requisitos:** Node.js >= 18.18, pnpm (o npm/yarn).

2. **Instalar dependencias:**
   ```bash
   pnpm install
   ```

3. **Variables de entorno:** Copiar el ejemplo y ajustar si usas backend real:
   ```bash
   cp .env.local.example .env.local
   ```
   Sin `NEXT_PUBLIC_API_BASE_URL` la app arranca en **modo mock** (datos en memoria).

4. **Levantar desarrollo:**
   ```bash
   pnpm dev
   ```
   App en **http://localhost:3000**.

5. **Tests:** `pnpm test` (watch: `pnpm run test:watch`).

6. **Lint:** `pnpm run lint`. Auto-fix: `pnpm run lint:fix`.

## Variables de entorno

| Variable                       | Requerida | Default | Descripción                          |
| ------------------------------ | --------- | ------- | ------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL`     | No        | `""`    | URL base del backend (sin `/` final) |
| `NEXT_PUBLIC_API_TIMEOUT`      | No        | `10000` | Timeout (ms) de las peticiones       |
| `NEXT_PUBLIC_DEFAULT_PER_PAGE` | No        | `10`    | Ítems por página                     |
| `NEXT_PUBLIC_MOCK_DELAY`       | No        | `400`   | Delay (ms) en respuestas mock        |

Con backend Rails en local suele usarse `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001` (o el puerto donde corra la API).

## Modo mock

Si `NEXT_PUBLIC_API_BASE_URL` está vacío, el servicio usa datos mock en memoria: listado de ejemplo, CRUD simulado, búsqueda por nombre/SKU, filtro por estado, paginación y validación de SKU duplicado. Los datos no persisten al recargar.

## Conexión con el backend

El backend debe exponer la API REST bajo `/api/v1`. Contrato detallado en `docs/Spec-product-backend.md` y `product-backend/doc/openapi.yaml`.

| Método   | Ruta                     | Descripción      |
| -------- | ------------------------ | ---------------- |
| GET      | /api/v1/products         | Listado (q, active, page, per_page) |
| GET      | /api/v1/products/:id     | Detalle          |
| POST     | /api/v1/products         | Crear            |
| PUT      | /api/v1/products/:id     | Actualizar       |
| DELETE   | /api/v1/products/:id     | Eliminar         |

**Body en POST/PUT:** el frontend envía JSON **plano** (atributos en la raíz), no anidado bajo `product`:
```json
{
  "name": "Producto",
  "description": "Descripción opcional",
  "price": 29.99,
  "stock": 10,
  "sku": "ABC123",
  "active": true
}
```

CORS debe permitir el origen del frontend en el backend.

## Docker

Build y ejecución con el Dockerfile incluido:

```bash
docker build -t product-frontend .
docker run -p 3000:3000 -e NEXT_PUBLIC_API_BASE_URL=http://host.docker.internal:3000 product-frontend
```

Opcional: pasar `--build-arg NEXT_PUBLIC_API_BASE_URL=...` en el build si se prefiere fijar la URL en la imagen.

## Deploy (Vercel)

Conectar el repo en [Vercel](https://vercel.com) y configurar las variables de entorno en el dashboard. Build: `next build`; las variables `NEXT_PUBLIC_*` se inyectan en build time.

## Estructura relevante

- `app/` — layout, page, providers (QueryClient + Toaster)
- `components/products/` — página principal, tabla, tarjetas, formulario, confirmación de borrado, filtros, paginación, estados vacío/carga
- `hooks/` — use-products, use-product, use-product-mutations, use-debounce
- `services/products.ts` — capa de servicios (fetch + modo mock)
- `lib/` — config, mock-data, validations (Zod)
- `types/product.ts` — tipos alineados al backend
- `__tests__/` — tests (servicios, hooks, componentes)

## Validaciones del formulario

Alineadas al backend: `name` 3–100 caracteres, `description` opcional max 1000, `price` > 0, `stock` >= 0, `sku` alfanumérico mayúsculas, `active` boolean. Errores 422 del servidor se mapean a los campos del formulario.
