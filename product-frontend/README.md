# Product Management Frontend

Panel de administracion de productos construido con **Next.js 16**, **React 19**, **TanStack Query**, **React Hook Form + Zod** y **shadcn/ui**.

Permite crear, leer, actualizar y eliminar productos con busqueda, filtrado por estado, paginacion y validacion completa de formularios.

---

## Tabla de contenido

- [Caracteristicas](#caracteristicas)
- [Stack tecnologico](#stack-tecnologico)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Requisitos previos](#requisitos-previos)
- [Instalacion local](#instalacion-local)
- [Variables de entorno](#variables-de-entorno)
- [Modo mock (sin backend)](#modo-mock-sin-backend)
- [Conexion con el backend real](#conexion-con-el-backend-real)
- [Deploy a produccion (Vercel)](#deploy-a-produccion-vercel)
- [API esperada](#api-esperada)
- [Validaciones del formulario](#validaciones-del-formulario)

---

## Caracteristicas

- **CRUD completo** -- Crear, ver, editar y eliminar productos
- **Busqueda en tiempo real** -- Filtro por nombre o SKU con debounce (300ms)
- **Filtrado por estado** -- Todos / Activos / Inactivos
- **Paginacion** -- Navegacion por paginas con control de items por pagina
- **Modo responsivo** -- Tabla de datos en desktop, tarjetas en mobile
- **Validacion** -- Client-side con Zod + errores de servidor (422) mapeados a campos del formulario
- **Mock integrado** -- 25 productos de ejemplo para trabajar sin backend
- **Notificaciones** -- Toasts con Sonner para feedback de operaciones

---

## Stack tecnologico

| Capa             | Tecnologia                          |
| ---------------- | ----------------------------------- |
| Framework        | Next.js 16 (App Router)             |
| UI               | React 19 + shadcn/ui + Tailwind v4  |
| Estado servidor  | TanStack Query v5                   |
| Formularios      | React Hook Form + Zod               |
| Iconos           | Lucide React                        |
| Notificaciones   | Sonner                              |
| Lenguaje         | TypeScript 5.7                      |

---

## Estructura del proyecto

```
app/
  layout.tsx          # Layout root con Providers
  page.tsx            # Pagina principal de productos
  providers.tsx       # QueryClientProvider + Toaster

components/
  products/
    products-page.tsx          # Componente orquestador principal
    product-filters.tsx        # Busqueda + filtro de estado
    product-table.tsx          # Vista tabla (desktop md+)
    product-card-list.tsx      # Vista tarjetas (mobile)
    product-form-dialog.tsx    # Dialog crear/editar producto
    delete-confirm-dialog.tsx  # Confirmacion de eliminacion
    product-pagination.tsx     # Controles de paginacion
    product-empty-state.tsx    # Estado vacio
    product-loading-skeleton.tsx # Skeleton de carga

hooks/
  use-products.ts           # Query: lista paginada
  use-product.ts            # Query: producto individual
  use-product-mutations.ts  # Mutations: crear, editar, eliminar
  use-debounce.ts           # Debounce para busqueda

lib/
  config.ts                 # Configuracion centralizada
  mock-data.ts              # Datos mock en memoria
  validations/
    product-schema.ts       # Schema Zod de validacion

services/
  products.ts               # Capa de servicios (mock + API real)

types/
  product.ts                # Tipos TypeScript (Product, ApiError, etc.)
```

---

## Requisitos previos

- **Node.js** >= 18.18
- **pnpm** (recomendado) o npm / yarn

---

## Instalacion local

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd <nombre-del-proyecto>

# 2. Instalar dependencias
pnpm install

# 3. Copiar variables de entorno
cp .env.local.example .env.local

# 4. Iniciar servidor de desarrollo
pnpm dev
```

La aplicacion estara disponible en `http://localhost:3000`.

> Sin configurar `NEXT_PUBLIC_API_BASE_URL`, la app arranca automaticamente en **modo mock** con 25 productos de ejemplo.

---

## Variables de entorno

Todas las variables usan el prefijo `NEXT_PUBLIC_` para estar disponibles tanto en servidor como en cliente.

| Variable                      | Requerida | Default  | Descripcion                                      |
| ----------------------------- | --------- | -------- | ------------------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL`    | No        | `""`     | URL base del backend Rails (sin `/` final)        |
| `NEXT_PUBLIC_API_TIMEOUT`     | No        | `10000`  | Timeout en ms para llamadas fetch                 |
| `NEXT_PUBLIC_DEFAULT_PER_PAGE`| No        | `10`     | Items por pagina por defecto                      |
| `NEXT_PUBLIC_MOCK_DELAY`      | No        | `400`    | Delay artificial (ms) en respuestas mock          |

### Ejemplos por entorno

**Desarrollo local (con backend Rails local):**
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_MOCK_DELAY=0
```

**Desarrollo local (sin backend -- modo mock):**
```env
# Dejar vacio o no definir para usar datos mock
NEXT_PUBLIC_API_BASE_URL=
NEXT_PUBLIC_MOCK_DELAY=400
```

**Staging:**
```env
NEXT_PUBLIC_API_BASE_URL=https://api-staging.tudominio.com
NEXT_PUBLIC_API_TIMEOUT=15000
```

**Produccion:**
```env
NEXT_PUBLIC_API_BASE_URL=https://api.tudominio.com
NEXT_PUBLIC_API_TIMEOUT=10000
NEXT_PUBLIC_DEFAULT_PER_PAGE=20
```

---

## Modo mock (sin backend)

Si `NEXT_PUBLIC_API_BASE_URL` esta vacio o no esta definido, el servicio de productos usa automaticamente una capa mock en memoria:

- **25 productos** pre-cargados con datos realistas
- **CRUD completo** funcional (crear, editar, eliminar)
- **Busqueda** por nombre y SKU
- **Filtrado** por estado activo/inactivo
- **Paginacion** simulada
- **Validacion de SKU duplicado** simulada
- **Errores 404** simulados para productos no encontrados
- **Delay configurable** para simular latencia de red

Los datos se reinician al recargar la pagina (son en memoria, no persisten).

---

## Conexion con el backend real

Para conectar con tu backend Rails, configura la variable de entorno:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

El servicio llamara automaticamente a las rutas de la API REST:

| Operacion     | Metodo   | Ruta                    |
| ------------- | -------- | ----------------------- |
| Listar        | `GET`    | `/api/v1/products`      |
| Ver detalle   | `GET`    | `/api/v1/products/:id`  |
| Crear         | `POST`   | `/api/v1/products`      |
| Actualizar    | `PUT`    | `/api/v1/products/:id`  |
| Eliminar      | `DELETE` | `/api/v1/products/:id`  |

### Headers enviados

Todas las peticiones incluyen:
```
Content-Type: application/json
Accept: application/json
```

### CORS

Asegurate de que tu backend Rails tenga CORS configurado para aceptar peticiones desde el origen del frontend:

```ruby
# config/initializers/cors.rb
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins "http://localhost:3000"  # desarrollo
    resource "/api/v1/*",
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options]
  end
end
```

---

## Deploy a produccion (Vercel)

### Opcion 1: Desde v0

1. Haz clic en el boton **"Publish"** en la esquina superior derecha de v0
2. Configura las variables de entorno en el panel de Vercel
3. Listo

### Opcion 2: Desde GitHub

```bash
# 1. Conecta tu repo a Vercel
# Visita https://vercel.com/new e importa el repositorio

# 2. O usa la CLI de Vercel
pnpm i -g vercel
vercel
```

### Opcion 3: CLI manual

```bash
# Build de produccion local
pnpm build

# Iniciar servidor de produccion
pnpm start
```

### Variables en Vercel Dashboard

1. Ve a **Settings > Environment Variables** en tu proyecto de Vercel
2. Agrega las variables para cada entorno (Production, Preview, Development):

| Variable                   | Production                       | Preview                              |
| -------------------------- | -------------------------------- | ------------------------------------ |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.tudominio.com`      | `https://api-staging.tudominio.com`  |
| `NEXT_PUBLIC_API_TIMEOUT`  | `10000`                          | `15000`                              |

> Vercel reconstruye la app automaticamente cuando cambias variables de entorno, ya que `NEXT_PUBLIC_*` se inyectan en build time.

---

## API esperada

El frontend espera que el backend responda con la siguiente estructura.

### Respuesta de lista `GET /api/v1/products`

```json
{
  "data": [
    {
      "id": 1,
      "name": "Wireless Mouse",
      "price": "29.99",
      "sku": "WM001",
      "active": true
    }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total_pages": 3,
    "total_count": 25
  }
}
```

### Respuesta de detalle `GET /api/v1/products/:id`

```json
{
  "data": {
    "id": 1,
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse with USB receiver",
    "price": "29.99",
    "stock": 150,
    "sku": "WM001",
    "active": true,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z"
  }
}
```

### Body de creacion/actualizacion

```json
{
  "product": {
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "price": 29.99,
    "stock": 150,
    "sku": "WM001",
    "active": true
  }
}
```

### Respuesta de error (422)

```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {
      "sku": ["has already been taken"],
      "name": ["is too short (minimum is 3 characters)"]
    }
  }
}
```

---

## Validaciones del formulario

El frontend valida antes de enviar al servidor:

| Campo         | Regla                                          |
| ------------- | ---------------------------------------------- |
| `name`        | Obligatorio, 3-100 caracteres                  |
| `description` | Opcional, maximo 1000 caracteres               |
| `price`       | Obligatorio, numero mayor que 0                |
| `stock`       | Obligatorio, entero >= 0                       |
| `sku`         | Obligatorio, solo letras mayusculas y numeros   |
| `active`      | Booleano, default `true`                       |

Si el servidor devuelve un error 422, los mensajes de `details` se mapean automaticamente a los campos correspondientes del formulario.
