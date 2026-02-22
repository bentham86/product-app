# Especificación de Software Detallada
## Enfoque: Spec Driven Development (SDD)

**Versión:** 1.1  
**Fecha:** 2025-02-22  
**Rol:** Senior Frontend Developer / Arquitecto de Software

---

## 1. Contexto del Proyecto

| Atributo | Valor |
|----------|--------|
| **Nombre** | product-frontend |
| **Objetivo** | Interfaz de usuario para la gestión de productos (CRUD), integrada con la API REST product-backend. |
| **API de referencia** | Backend según `docs/Spec-product-backend.md`; contrato en `product-backend/doc/openapi.yaml`. Base URL configurable por entorno. |

### 1.1 Alcance

- Listado de productos con visualización en tarjetas (cards) y/o tabla, paginación (10 ítems por defecto), búsqueda por nombre y filtros por estado (active).
- Formulario en modal para crear y editar productos, con validaciones en tiempo real alineadas a las reglas del backend.
- Flujo de eliminación con confirmación visual y notificaciones (toasts).
- Manejo explícito de estados: Loading, Empty y Error.
- Tipado estricto TypeScript y estructura modular para mantenibilidad.

---

## 2. Stack Tecnológico (obligatorio)

| Capa | Tecnología | Notas |
|------|------------|--------|
| **Framework** | Next.js (App Router) | Preferido App Router; rutas bajo `app/`. |
| **Lenguaje** | TypeScript | Tipado estricto (`strict: true`); sin `any` innecesarios. |
| **Estilos** | TailwindCSS | Diseño responsive; utilidades primero; componentes reutilizables. |
| **Estado y caché servidor** | React Query (TanStack Query) | Listados, detalle, mutaciones (create/update/delete); invalidación de caché tras mutaciones. |
| **Testing** | Jest + React Testing Library | Unit y pruebas de componentes; mocks de API y providers. |
| **HTTP** | Axios o Fetch | Capa de servicios centralizada; base URL desde variables de entorno. |
| **Validación de formularios** | Zod + React Hook Form | Esquemas Zod alineados a reglas del backend; validación en tiempo real. |
| **UI feedback** | Toasts / notificaciones | Librería ligera (ej. react-hot-toast, sonner o similar) para éxito/error. |

---

## 3. Integración con la API (backend existente)

### 3.1 URL base y variables de entorno

- **Variable obligatoria:** `NEXT_PUBLIC_API_BASE_URL` (ej. `http://localhost:3000`). Todas las peticiones usan esta base; sin URLs hardcodeadas.
- **Variables opcionales:** `NEXT_PUBLIC_API_TIMEOUT` (timeout en ms), `NEXT_PUBLIC_DEFAULT_PER_PAGE` (ítems por página), `NEXT_PUBLIC_MOCK_DELAY` (delay en ms en modo mock).
- **Modo mock (opcional):** Si no hay API base definida, la app puede usar una capa mock en memoria para desarrollo sin backend.

### 3.2 Contrato de la API (resumen)

- **Base path:** `/api/v1`.
- **Listado:** `GET /api/v1/products?q=&active=&page=1&per_page=10` → `{ data: ProductList[], meta: PaginationMeta }`.
- **Detalle:** `GET /api/v1/products/:id` → `{ data: Product }` o 404.
- **Crear:** `POST /api/v1/products` body ProductInput → 201 `{ data: Product }` o 422 con `{ error: { code, message, details } }`.
- **Actualizar:** `PUT /api/v1/products/:id` body parcial → 200 `{ data: Product }` o 404/422.
- **Eliminar:** `DELETE /api/v1/products/:id` → 204 sin body o 404.

### 3.3 Tipos e interfaces TypeScript (alineados al modelo Product del backend)

Definir en una capa dedicada (ej. `types/product.ts` o `types/api.ts`):

```ts
// Recurso completo (GET :id, POST, PUT)
export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string;       // backend devuelve string "19.99"
  stock: number;
  sku: string;
  active: boolean;
  created_at: string; // ISO 8601
  updated_at: string;
}

// Ítem en listado (GET /products)
export interface ProductListItem {
  id: number;
  name: string;
  price: string;
  sku: string;
  active: boolean;
}

// Paginación (meta en GET /products)
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
}

// Respuestas de éxito
export interface ProductResponse {
  data: Product;
}
export interface ProductListResponse {
  data: ProductListItem[];
  meta: PaginationMeta;
}

// Body para crear/actualizar
export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku: string;
  active?: boolean;
}

// Errores API
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

- Los **servicios** (capa `services/`) consumen estos tipos y exponen funciones que devuelven `ProductListResponse`, `Product`, etc., manejando códigos 404/422 y lanzando errores tipados o estructuras de error para que React Query o la UI los traten.

### 3.4 Capa de servicios

- **Ubicación:** `services/` o `lib/api/` (ej. `services/products.ts`).
- **Responsabilidad:** Funciones que llaman a la API (Fetch o Axios), construyen la URL desde `NEXT_PUBLIC_API_BASE_URL`, envían/reciben JSON y devuelven datos tipados o propagan errores (status, body con `ApiError`). Timeout recomendado (ej. con `AbortController`); opcionalmente capa mock cuando no hay API base.
- **Funciones:** `fetchProducts(params)`, `fetchProduct(id)`, `createProduct(body)`, `updateProduct(id, body)`, `deleteProduct(id)`. Sin lógica de estado de UI.

### 3.5 Formato del body en POST/PUT (alineación con backend)

- El backend product-backend (Rails) espera JSON con atributos **en la raíz** (`params.permit(:name, :description, ...)`). El frontend debe enviar body **plano**: `{ "name": "...", "description": "...", "price": 29.99, "stock": 0, "sku": "ABC123", "active": true }` (sin envolver en un objeto `product`)..

---

## 4. Requerimientos de Funcionalidad

### 4.1 Listado de productos

- **Visualización:** Tarjetas (cards) y/o tabla; se puede ofrecer cambio de vista (toggle) o una vista por defecto (ej. tarjetas en móvil, tabla en escritorio).
- **Paginación:** 10 ítems por página por defecto; controles para página anterior/siguiente y/o selector de página; mostrar información de paginación (ej. “Página X de Y”, “N ítems en total”).
- **Búsqueda:** Campo de búsqueda por nombre; envío del parámetro `q` a la API (con debounce recomendado, ej. 300–400 ms).
- **Filtros:** Filtro por estado (active): todos / activos / inactivos; parámetro `active` (boolean o vacío) en la petición.
- **Origen de datos:** React Query (ej. `useProducts` con `queryKey` que incluya `page`, `per_page`, `q`, `active`) para caché e invalidación.

### 4.2 Formulario de producto (modal)

- **Uso:** Crear producto (modal “Nuevo producto”) y editar producto (modal “Editar producto” con datos precargados).
- **Contenido:** Campos alineados al modelo Product — name, description (opcional), price, stock, sku, active (checkbox o switch).
- **Validación en tiempo real:** Con Zod + React Hook Form; reglas coherentes con el backend:
  - **name:** requerido, longitud mínima 3, máxima 100.
  - **description:** opcional, máxima 1000 caracteres.
  - **price:** requerido, número, mayor que 0.
  - **stock:** requerido, entero, mayor o igual a 0.
  - **sku:** requerido, formato alfanumérico mayúsculas (regex o transformación a mayúsculas antes de validar).
  - **active:** boolean, por defecto true.
- **Envío:** Al enviar, llamar a la API (create o update); en éxito cerrar modal, mostrar toast de éxito e invalidar la query del listado (y opcionalmente detalle); en 422 mostrar errores de servidor en el formulario (ej. `details` por campo).
- **Estados:** Deshabilitar submit mientras se envía; mostrar indicador de carga en el botón o en el modal.

### 4.3 Flujo de eliminación

- **Acción:** Botón/acción “Eliminar” por producto (en tarjeta o fila de tabla).
- **Confirmación:** Modal o diálogo de confirmación antes de llamar a DELETE (“¿Eliminar el producto X?”).
- **Petición:** Llamar a `DELETE /api/v1/products/:id`; en 204 (éxito) cerrar el modal de confirmación, mostrar toast de éxito e invalidar listado (y detalle si aplica); en 404 mostrar toast de error (ej. “Producto no encontrado”).
- **Toasts:** Usar la misma librería de notificaciones que en create/update para consistencia.

### 4.4 Estados de UI (Loading, Empty, Error)

- **Loading:** Mientras se carga el listado o el detalle, mostrar skeleton o spinner coherente con el diseño; no dejar la página en blanco sin feedback.
- **Empty:** Cuando el listado devuelve `data: []` (y no hay error), mostrar un estado vacío con mensaje y, si aplica, CTA para “Crear primer producto”.
- **Error:** Cuando la API devuelve error (404, 422, 5xx) o fallo de red, mostrar mensaje claro (ej. “No se pudieron cargar los productos”) y opción de reintentar; en formularios, mostrar errores por campo cuando existan `details` en 422.

---

## 5. Arquitectura de Carpetas (estructura modular)

Estructura objetivo orientada a mantenibilidad y separación de responsabilidades:

```
product-frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                 # Página principal (listado)
│   ├── globals.css
│   └── providers.tsx            # QueryClientProvider, etc.
├── components/
│   ├── ui/                       # Componentes reutilizables sin lógica de negocio
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Card.tsx
│   │   ├── Table.tsx
│   │   ├── Skeleton.tsx
│   │   └── ...
│   └── features/
│       └── products/
│           ├── ProductList.tsx
│           ├── ProductCard.tsx
│           ├── ProductTable.tsx
│           ├── ProductFormModal.tsx
│           ├── DeleteConfirmModal.tsx
│           ├── ProductFilters.tsx
│           └── ProductEmptyState.tsx
├── hooks/
│   ├── useProducts.ts            # Query listado (params: page, per_page, q, active)
│   ├── useProduct.ts             # Query detalle por id
│   ├── useProductMutation.ts     # Mutations create, update, delete
│   └── useDebounce.ts            # Opcional, para búsqueda
├── services/
│   ├── api.ts                    # Cliente HTTP (base URL, headers)
│   └── products.ts               # fetchProducts, fetchProduct, create, update, delete
├── types/
│   ├── product.ts                # Product, ProductListItem, ProductInput, etc.
│   └── api.ts                    # ProductResponse, ProductListResponse, ApiError, PaginationMeta
├── lib/
│   └── validations/
│       └── productSchema.ts      # Esquema Zod para producto
├── styles/
│   └── (si se usan variables Tailwind o temas)
├── __tests__/
│   ├── components/
│   ├── hooks/
│   └── services/
├── public/
├── .env.local.example            # NEXT_PUBLIC_API_BASE_URL=
├── Dockerfile                    # Multi-stage (dev + production)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

- **components/ui:** Componentes genéricos (botones, inputs, modales, tablas, skeletons) reutilizables en cualquier feature.
- **components/features/products** o **components/products:** Componentes específicos del dominio “productos” (ej. listado, tabla, tarjetas, formulario, filtros, paginación, estados vacío/error).
- **hooks:** Lógica reutilizable: `useProducts`, `useProduct`, mutaciones create/update/delete, opcional `useDebounce` para búsqueda.
- **services:** Llamadas HTTP; sin estado de React.
- **types:** Interfaces y tipos compartidos; una única fuente de verdad para el contrato con la API.
- **lib:** Configuración (`lib/config.ts`), datos mock opcionales (`lib/mock-data.ts`), utilidades (`lib/utils.ts`), esquemas Zod (`lib/validations/product-schema.ts`).
- **lib/validations:** Esquemas Zod (y si se desea, helpers de mensajes) para alinear validación frontend con el backend.

---

## 6. Estrategia de Validación (Zod + React Hook Form)

### 6.1 Librerías

- **Zod:** Definición de esquemas y validación; coherente con reglas del backend (longitudes, numéricos, formato SKU).
- **React Hook Form:** Gestión del formulario (valores, touched, errors, submit); integración con Zod mediante `@hookform/resolvers/zod`.

### 6.2 Reglas de negocio (espejo del backend)

| Campo | Regla | Mensaje de error sugerido |
|-------|--------|----------------------------|
| name | string, min 3, max 100 | "Entre 3 y 100 caracteres" |
| description | string opcional, max 1000 | "Máximo 1000 caracteres" |
| price | number, > 0 | "Debe ser mayor que 0" |
| stock | integer, >= 0 | "Entero mayor o igual a 0" |
| sku | string, formato [A-Z0-9]+ (mayúsculas) | "Solo letras y números en mayúsculas" |
| active | boolean | — |

- **SKU:** Normalizar a mayúsculas en el formulario (onBlur o al enviar) para evitar rechazos del backend; el backend también normaliza, pero mantener consistencia en UI.

### 6.3 Uso en el modal

- Un único esquema Zod reutilizable para crear y editar; en edición, valores por defecto desde `product` (si existe).
- Mostrar errores bajo cada campo en tiempo real (modo `onChange` o `onBlur` según UX deseada).
- En 422, mapear `error.details` del backend a `setError` de React Hook Form por campo para mostrar errores de servidor (ej. “has already been taken” en sku).

---

## 7. Diseño de UI/UX

### 7.1 Principios

- Interfaz **limpia y moderna**; prioridad a legibilidad y contraste.
- **Responsive:** Móvil primero o breakpoints definidos (ej. sm, md, lg); listado en tarjetas en móvil y tabla en pantallas grandes (o según criterio del equipo).
- **Accesibilidad:** Labels asociados a inputs, contraste suficiente, focos visibles y semántica correcta (botones, enlaces, headings).

### 7.2 Paleta de colores

- **Primario:** Un color de marca para acciones principales (botones crear, guardar, enlaces). Ej. azul o verde.
- **Neutros:** Escala de grises para fondos (fondo de página, cards), bordes y texto secundario.
- **Estados semánticos:** Verde/success (éxito, toast éxito), rojo/error (errores, toast error), amarillo/amber (advertencia si se usa).
- **Fondo y superficie:** Fondo claro o oscuro según tema; tarjetas/tabla con fondo diferenciado (ej. white o gray-50 en light mode).
- Definir variables en Tailwind (theme.extend.colors) para mantener consistencia y facilitar un futuro tema oscuro si se desea.

### 7.3 Componentes responsivos

- **Listado:** Grid de tarjetas en móvil (1 columna); 2–3 columnas en tablet; tabla o grid en desktop.
- **Modal:** Ancho máximo (ej. max-w-md o max-w-lg); centrado; scroll interno si el contenido es largo; en móvil ocupar la mayor parte del viewport.
- **Tabla:** Scroll horizontal en móvil si se mantiene tabla; o sustituir por tarjetas en breakpoint pequeño.
- **Filtros y búsqueda:** En móvil apilar verticalmente; en desktop en una sola fila.

---

## 8. Hooks Personalizados

### 8.1 useProducts

- **Propósito:** Obtener el listado paginado con filtros y búsqueda.
- **Parámetros:** `page`, `per_page`, `q`, `active` (opcional).
- **Implementación:** `useQuery` con `queryKey: ['products', page, per_page, q, active]` y función que llama a `fetchProducts(params)`.
- **Retorno:** `data`, `isLoading`, `isError`, `error`, `refetch`; opcionalmente `pagination` derivado de `data.meta`.

### 8.2 useProduct(id)

- **Propósito:** Obtener el detalle de un producto por id (para edición en modal).
- **Implementación:** `useQuery` con `queryKey: ['product', id]`, habilitado solo cuando `id` es válido; llama a `fetchProduct(id)`.
- **Retorno:** `data`, `isLoading`, `isError`, `error`, `refetch`.

### 8.3 useProductMutation

- **Propósito:** Encapsular las mutaciones crear, actualizar y eliminar.
- **Implementación:** `useMutation` (o tres `useMutation`) para create, update, delete; en `onSuccess` invalidar queries (`queryClient.invalidateQueries(['products'])`, y si aplica `['product', id]`); en `onError` se puede mostrar toast desde el componente o desde el hook si se inyecta un notificador.
- **Retorno:** Funciones `createProduct`, `updateProduct`, `deleteProduct` (o un objeto con `mutate`, `mutateAsync` por tipo) y estados `isPending`, `isError`, `error`.

### 8.4 useDebounce (opcional)

- **Propósito:** Debounce del valor de búsqueda antes de pasarlo a `useProducts`, para no disparar una petición por cada tecla.
- **Uso:** Estado local para el input; valor debounced (ej. 300–400 ms) usado en la `queryKey` de `useProducts`.

---

## 9. Testing (Jest + React Testing Library)

### 9.1 Alcance

- **Componentes:** Render de componentes con providers (QueryClient, router mock si aplica); interacción con botones, inputs y modales; verificación de textos y estados (loading, empty, error).
- **Hooks:** Tests de `useProducts`, `useProductMutation` con `QueryClient` y mocks de servicios (MSW o jest.mock del módulo de servicios).
- **Servicios:** Tests unitarios de las funciones de API con mocks de Fetch/Axios; comprobar que se construye la URL y el body correctos y que se parsea la respuesta según el tipo.

### 9.2 Buenas prácticas

- Mock de `NEXT_PUBLIC_API_BASE_URL` y del cliente HTTP en tests.
- No depender de la API real en tests automatizados; usar datos fixture (objetos Product, ProductListResponse) en tests.
- Casos recomendados: listado vacío, listado con datos, error de red, formulario con validación (campo inválido), flujo de eliminación con confirmación.

---

## 10. Configuración de Docker

### 10.1 Dockerfile (multi-stage)

- **Stage 1 (dependencies):** Imagen base Node (LTS); copiar `package.json` y `package-lock.json`; `npm ci` (o `yarn install --frozen-lockfile`).
- **Stage 2 (build):** Desde stage 1; copiar código fuente; construir la app (`npm run build` o `next build`); salida de build en `.next` (o la que use el framework).
- **Stage 3 (production):** Imagen base Node slim o alpine; solo archivos necesarios para ejecutar (node_modules de producción, `.next`, `public`, etc.); variable de entorno para `NEXT_PUBLIC_API_BASE_URL` o pasada en runtime; exponer puerto (ej. 3000); comando `npm start` o `next start`.
- **Desarrollo:** Opcionalmente un stage o Dockerfile.dev que ejecute `npm run dev` con volumen para hot-reload.

### 10.2 Variables de entorno en Docker

- En producción, inyectar `NEXT_PUBLIC_API_BASE_URL` en el build o en el arranque del contenedor (según si Next.js requiere rebuild para public env).
- Documentar en README las variables necesarias (ej. `.env.local.example` con `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000`).

---

## 11. Resumen de Tareas del SDD

| # | Tarea |
|---|--------|
| 1 | Estructura de carpetas modular (app, components/ui, components/products o features/products, hooks, services, types, lib/config, lib/validations, lib/mock-data si hay modo mock). Ver §5. |
| 2 | Definir tipos TypeScript (Product, ProductListItem, ProductInput, ProductResponse, ProductListResponse, ApiError, PaginationMeta) alineados al backend. |
| 3 | Capa de servicios (Fetch o Axios; timeout; products: fetchProducts, fetchProduct, create, update, delete) con base URL desde env; opcional capa mock cuando no hay API. |
| 4 | Esquema Zod y React Hook Form para el formulario de producto (reglas name, description, price, stock, sku, active). |
| 5 | Hooks useProducts, useProduct, mutaciones create/update/delete; opcional useDebounce para búsqueda. |
| 6 | UI: listado (tarjetas y/o tabla), paginación 10 ítems, búsqueda y filtro por estado; estados Loading, Empty, Error. |
| 7 | Modal de formulario crear/editar con validación en tiempo real y manejo de 422 (errores por campo). |
| 8 | Flujo de eliminación con modal de confirmación y toasts (éxito/error). |
| 9 | Paleta y componentes responsivos (Tailwind); variables de tema si aplica. |
| 10 | Alinear formato del body POST/PUT con el backend (body plano o backend con anidado). Ver §3.5. |
| 11 | Tests con Jest y RTL para componentes, hooks y servicios. Ver §9. |
| 12 | Dockerfile multi-stage para build y producción (opcional). Ver §10. |

---

## 12. Referencias

- **API Backend:** `docs/Spec-product-backend.md`, `product-backend/doc/openapi.yaml`.
- **Next.js App Router:** https://nextjs.org/docs/app.
- **TanStack Query:** https://tanstack.com/query/latest.
- **Zod:** https://zod.dev.
- **React Hook Form:** https://react-hook-form.com.
- **TailwindCSS:** https://tailwindcss.com/docs.

---
