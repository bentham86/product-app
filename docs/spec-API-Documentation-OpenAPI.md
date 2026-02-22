# Especificación de Software Detallada
# Documentación de API (Swagger/OpenAPI) — product-backend

**Versión:** 1.0  
**Fecha:** 2025-02-22  
**Rol:** Senior Backend Developer / Arquitecto de Software  
**Enfoque:** Spec Driven Development (SDD)

---

## 1. Spec Driven Development (SDD) — Uso de este documento

Este documento es la **especificación que impulsa la implementación** de la documentación de API con OpenAPI/Swagger. La spec es la **fuente de verdad**: el spec OpenAPI y la interfaz de usuario (Swagger UI) se implementan para cumplir lo descrito aquí.

### 1.1 Principios SDD aplicados

- **Spec primero:** Esta especificación se redacta o actualiza **antes** de implementar. Cualquier cambio de alcance o contrato de documentación se refleja primero aquí.
- **Implementación guiada por la spec:** El archivo OpenAPI (YAML/JSON), la ruta de acceso a Swagger UI y la configuración se implementan para satisfacer exactamente lo descrito en las secciones siguientes.
- **Consistencia con la API:** El contenido del OpenAPI debe reflejar la API real definida en `docs/spec-product-backend.md` (§5 Endpoints, §11 Respuesta JSON). Cualquier discrepancia se resuelve alineando el OpenAPI a la Spec del backend (o actualizando ambas specs si se cambia el contrato).

### 1.2 Ciclo de trabajo recomendado

1. Redactar o actualizar esta especificación.
2. Implementar el spec OpenAPI y/o la integración (gemas, ruta, UI) según esta spec.
3. Validar que la documentación expuesta coincida con los endpoints y respuestas reales (manual o con tests).
4. Para cambios en la API documentada: actualizar primero la Spec del backend si aplica, luego esta spec y por último el OpenAPI.

---

## 2. Contexto del Proyecto

| Atributo | Valor |
|----------|--------|
| **Nombre** | Documentación de API (OpenAPI/Swagger) para product-backend |
| **Dependencia** | API existente según `docs/spec-product-backend.md` (namespace `/api/v1`, recurso Products). |
| **Objetivo** | Exponer documentación interactiva y machine-readable de la API (OpenAPI 3.x) y una interfaz Swagger UI para consulta y pruebas. |

### 2.1 Alcance

- Generar o mantener un **documento OpenAPI** (3.0.x o 3.1) que describa todos los endpoints de `/api/v1` (Products).
- Ofrecer **Swagger UI** (u otra UI compatible con OpenAPI) accesible desde la misma aplicación (ruta dedicada, ej. `/api-docs`).
- La documentación debe ser coherente con las respuestas JSON estándar definidas en la Spec del backend (§11): estructura `data` / `meta`, formato de errores `error` con `code`, `message`, `details`.
- **Fuera de alcance en esta spec:** documentar endpoints fuera de `/api/v1` (salvo que se indique explícitamente); autenticación OAuth2/OpenID en el spec (a menos que se añada en el futuro); generación de clientes SDK a partir del OpenAPI (opcional, no obligatorio).

---

## 3. Estándar OpenAPI y Estructura del Documento

### 3.1 Versión y formato

- **Versión OpenAPI:** 3.0.x (recomendado 3.0.3) o 3.1.
- **Formato del archivo:** YAML (recomendado) o JSON. Un único archivo principal (ej. `openapi.yaml` o `openapi.json`).

### 3.2 Estructura obligatoria del documento

- **openapi:** versión (ej. `3.0.3`).
- **info:**
  - **title:** nombre de la API (ej. "Product API" o "product-backend API").
  - **version:** versión de la API documentada (ej. "1.0").
  - **description:** descripción breve (opcional).
- **servers:** al menos una entrada; en desarrollo `url: http://localhost:3000` (o la base URL que corresponda). Puede añadirse una entrada para otro entorno si aplica.
- **paths:** definición de cada endpoint (ver §4).
- **components:** reutilización de schemas y respuestas (ver §5).

### 3.3 Convenciones

- Todos los paths documentados bajo el prefijo que refleje la API: `/api/v1/...`.
- Content-Type de request/response: `application/json`.
- Los schemas de respuesta deben reflejar exactamente la estructura real (envoltura `data`, `meta` en listados, `error` en errores).

---

## 4. Paths — Endpoints a Documentar

La API a documentar es la definida en `spec-product-backend.md` (§5). A continuación se especifica qué debe aparecer en el OpenAPI para cada path.

### 4.1 GET /api/v1/products

- **Descripción:** Listado paginado de productos con búsqueda por nombre y filtro por estado activo.
- **Parámetros de query:**
  - `q` (opcional, string): búsqueda por nombre (ILIKE).
  - `active` (opcional, boolean): filtrar por estado activo.
  - `page` (opcional, integer, default 1): número de página.
  - `per_page` (opcional, integer, default 10, máx 100): ítems por página.
- **Respuestas:**
  - **200:** Cuerpo con `data` (array de ítems de producto en vista list) y `meta` (objeto con `current_page`, `per_page`, `total_pages`, `total_count`). Schema según §5.1 (ProductListResponse).
  - No se documentan otras respuestas obligatorias para este endpoint salvo que la API las devuelva (ej. 500).

### 4.2 GET /api/v1/products/{id}

- **Descripción:** Detalle de un producto por ID.
- **Parámetros de path:** `id` (required, integer, identificador del producto).
- **Respuestas:**
  - **200:** Cuerpo con `data` (objeto Product completo). Schema según §5.1 (ProductResponse).
  - **404:** Cuerpo con `error` (code, message). Schema según §5.2 (ErrorResponse).

### 4.3 POST /api/v1/products

- **Descripción:** Creación de un producto. Lógica vía Interactor (Spec backend).
- **Request body:** Objeto con campos del producto (name, description, price, stock, sku, active). Schema según §5.1 (ProductInput). Content-Type: `application/json`.
- **Respuestas:**
  - **201:** Cuerpo con `data` (Product creado). Schema según §5.1 (ProductResponse).
  - **422:** Cuerpo con `error` (code, message, details). Schema según §5.2 (ValidationErrorResponse).

### 4.4 PUT /api/v1/products/{id}

- **Descripción:** Actualización parcial o total de un producto por ID.
- **Parámetros de path:** `id` (required, integer).
- **Request body:** Objeto con los campos a actualizar (todos opcionales en el schema para PATCH-style). Schema según §5.1 (ProductInput o ProductUpdateInput).
- **Respuestas:**
  - **200:** Cuerpo con `data` (Product actualizado). Schema según §5.1 (ProductResponse).
  - **404:** Error según §5.2 (ErrorResponse).
  - **422:** Validación según §5.2 (ValidationErrorResponse).

### 4.5 DELETE /api/v1/products/{id}

- **Descripción:** Eliminación de un producto por ID.
- **Parámetros de path:** `id` (required, integer).
- **Respuestas:**
  - **204:** Sin contenido (no body).
  - **404:** Cuerpo con `error` según §5.2 (ErrorResponse).

---

## 5. Components — Schemas y Respuestas Reutilizables

Los siguientes componentes deben definirse en `components.schemas` (y opcionalmente en `components.responses`) para mantener el spec alineado con la Spec del backend (§11).

### 5.1 Schemas de producto y respuestas de éxito

- **Product (objeto recurso):**
  - `id` (integer, read-only), `name` (string), `description` (string, nullable), `price` (string, formato dos decimales, ej. "19.99"), `stock` (integer), `sku` (string), `active` (boolean), `created_at` (string, datetime ISO 8601), `updated_at` (string, datetime ISO 8601).

- **ProductList (ítem en listado):**
  - Subconjunto: `id`, `name`, `price`, `sku`, `active` (según vista :list del ProductBlueprint).

- **ProductResponse (respuesta de un recurso):**
  - Propiedad `data` de tipo Product.

- **ProductListResponse (respuesta de listado paginado):**
  - `data`: array de ProductList.
  - `meta`: objeto con `current_page` (integer), `per_page` (integer), `total_pages` (integer), `total_count` (integer).

- **ProductInput (body para POST/PUT):**
  - `name` (string, requerido, minLength 3, maxLength 100), `description` (string, maxLength 1000, opcional), `price` (number, requerido, exclusiveMinimum 0), `stock` (integer, requerido, minimum 0), `sku` (string, requerido, patrón alfanumérico mayúsculas), `active` (boolean, opcional, default true).

### 5.2 Schemas de error

- **ErrorResponse (404 u otros errores simples):**
  - `error`: objeto con `code` (string, ej. "not_found"), `message` (string).

- **ValidationErrorResponse (422):**
  - `error`: objeto con `code` (string, ej. "validation_error"), `message` (string), `details` (objeto; claves son nombres de campo, valores son arrays de strings con mensajes de error).

---

## 6. Swagger UI y Acceso a la Documentación

### 6.1 Requisito funcional

- Debe existir una **ruta HTTP** (ej. `GET /api-docs` o `GET /swagger`) que sirva la **interfaz Swagger UI** (o equivalente compatible con OpenAPI 3.x).
- La UI debe cargar el documento OpenAPI (por URL pública al spec o desde un archivo servido por la misma app) de modo que se listen todos los paths y se puedan ejecutar “Try it out” contra la API real (usando el mismo origin o el server definido en el OpenAPI).

### 6.2 Entorno

- En **desarrollo local** (y en Docker con app en puerto 3000): la URL de la documentación debe ser accesible, por ejemplo `http://localhost:3000/api-docs`.
- El **servidor** en `servers` del OpenAPI debe permitir que “Try it out” apunte a la base URL correcta (localhost:3000 en desarrollo).

### 6.3 Implementación (orientación)

- **Opción A — Spec manual:** Mantener un archivo `openapi.yaml` (o `openapi.json`) en el repositorio (ej. en `product-backend/doc/openapi.yaml` o `product-backend/spec/openapi.yaml`). Configurar la aplicación para servir Swagger UI (gem o assets estáticos) y que la UI cargue ese archivo (por ruta relativa o absoluta).
- **Opción B — rswag:** Generar el spec a partir de los request specs de RSpec y servir Swagger UI mediante la misma gema; el contenido del spec debe cumplir igualmente §4 y §5 de esta especificación.

La elección (A o B) queda a criterio del equipo; esta spec no impone una herramienta concreta, sí el **resultado**: documento OpenAPI conforme a §3–§5 y UI accesible según §6.1–6.2.

---

## 7. Ubicación del Spec y Mantenimiento

### 7.1 Ubicación del archivo OpenAPI

- **Recomendación:** Un único archivo principal dentro del proyecto del backend, por ejemplo:
  - `product-backend/doc/openapi.yaml`, o
  - `product-backend/spec/openapi.yaml`, o
  - Ruta que genere la gema (ej. rswag) si se usa generación automática.
- El archivo debe estar bajo control de versiones (Git) para que los cambios en la documentación sean trazables.

### 7.2 Sincronización con la API

- Al **añadir, modificar o eliminar** un endpoint en la API (o cambiar el formato de respuesta según spec-product-backend §11), el documento OpenAPI debe actualizarse en consecuencia.
- Si se usa Spec Driven Development de forma estricta: primero se actualiza la Spec del backend (y esta spec si cambia el alcance de la documentación), luego el código de la API, y por último el OpenAPI y la UI.

### 7.3 Validación (opcional)

- Se recomienda validar el archivo OpenAPI con una herramienta estándar (ej. `swagger-cli validate`, o el validador de https://editor.swagger.io/) antes de hacer commit o en un paso de CI, para garantizar que el YAML/JSON sea válido según OpenAPI 3.x.

---

## 8. Resumen de Tareas del SDD — Documentación de API

| # | Tarea |
|---|--------|
| 1 | Decidir enfoque: spec OpenAPI manual (YAML/JSON) o generación desde tests (ej. rswag). |
| 2 | Crear el archivo OpenAPI con la estructura mínima (§3): openapi, info, servers, paths, components. |
| 3 | Documentar en **paths** todos los endpoints de Products (§4): GET list, GET :id, POST, PUT, DELETE. |
| 4 | Definir en **components.schemas** los schemas de Product, ProductList, ProductResponse, ProductListResponse, ProductInput, ErrorResponse, ValidationErrorResponse (§5). |
| 5 | Configurar la ruta de **Swagger UI** y que cargue el spec; verificar acceso en desarrollo (y Docker) (§6). |
| 6 | Validar que las respuestas de ejemplo y “Try it out” coincidan con la API real (spec-product-backend §11). |
| 7 | (Opcional) Añadir validación del OpenAPI en CI. Documentar en README (o en spec-product-backend) la URL de la documentación y cómo actualizar el spec. |

---

## 9. Referencias

- **Spec del backend:** `docs/spec-product-backend.md` (§5 Endpoints, §11 Definición de Respuesta JSON Estándar).
- **OpenAPI 3.0:** https://swagger.io/specification/
- **Swagger UI:** https://swagger.io/tools/swagger-ui/

---
