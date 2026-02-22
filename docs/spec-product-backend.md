# Especificación de Software Detallada
# product-backend — Versión 2
## Enfoque: Spec Driven Development (SDD)

**Versión:** 2.0  
**Fecha:** 2025-02-21  
**Rol:** Senior Backend Developer / Arquitecto de Software

## 1. Contexto del Proyecto

| Atributo | Valor |
|----------|--------|
| **Nombre** | product-backend |
| **Stack** | Ruby on Rails (modo `--api`), PostgreSQL, Docker & Docker Compose |
| **Objetivo** | CRUD de gestión de productos con búsqueda, filtrado y paginación |

### 1.1 Alcance
- API REST para gestión completa de productos (Create, Read, Update, Delete).
- Búsqueda por nombre y filtrado por estado (`active`).
- Paginación en listados.
- **Respuestas JSON generadas por Blueprints/Serializers** (objetos de dominio → JSON limpio y eficiente).
- Entorno reproducible con Docker.

---

## 2. Arquitectura y Patrones de Diseño

### 2.1 Lógica de Negocio
- **Patrón:** Servicios encapsulados con la gema **interactor**.
- Operaciones de escritura (Crear, Actualizar, Eliminar) delegan en Interactors; los controladores orquestan el interactor y la respuesta HTTP.

### 2.2 Capa de Presentación: Blueprints y Serializers
- **Objetivo:** Separar la forma del modelo (dominio) de la forma expuesta por la API (contrato JSON). Así se obtienen:
  - **JSON limpio y personalizado:** solo los campos que la API quiere exponer, con nombres y formatos estables.
  - **Eficiencia:** en listados se puede exponer un subconjunto de campos (vista “list”) para reducir payload y tiempo de serialización.
  - **Mantenibilidad:** cambios en el modelo no obligan a tocar controladores si el contrato se mantiene; los cambios se centralizan en blueprints/serializers.

- **Implementación recomendada:** Gema **Blueprinter**.
  - Una **Blueprint** es una clase que define cómo se serializa un tipo de objeto (por ejemplo `Product`) a JSON.
  - Se pueden definir **vistas** (views) distintas: por ejemplo `:default` (detalle completo) y `:list` (campos mínimos para listados).

- **Convención de uso:**
  - Los controladores **nunca** construyen hashes de respuesta a mano para recursos de dominio; siempre usan el blueprint/serializer correspondiente.
  - Respuestas de éxito: `ProductBlueprint.render(product)` o `ProductBlueprint.render(products, view: :list)` para colecciones.
  - Las respuestas de error pueden usar un formato estándar (hash fijo) o un **ErrorBlueprint** si se desea homogeneizar también los errores.

### 2.3 API
- **Versionamiento:** Todas las rutas bajo el namespace `/api/v1/`.
- **Formato:** JSON (Content-Type: `application/json`), generado por Blueprints/Serializers.

### 2.4 Paginación
- **Implementación:** Gema **Pagy**.
- **Tamaño por defecto:** 10 ítems por página.
- Parámetros: `page`, `per_page` (opcional, límite máx. ej. 100). Los ítems de la página se serializan con la vista de listado del blueprint.

### 2.5 CORS
- **rack-cors** para permitir peticiones desde orígenes externos (orígenes, métodos y headers según política de seguridad).

---

## 3. Modelo de Datos: Product

### 3.1 Tabla `products`

| Campo | Tipo | Restricciones | Default |
|-------|------|---------------|---------|
| `name` | string | requerido, longitud 3–100 | — |
| `description` | text | opcional, máx 1000 | — |
| `price` | decimal | requerido, > 0 | — |
| `stock` | integer | requerido, >= 0 | — |
| `sku` | string | requerido, único, formato alfanumérico mayúsculas | — |
| `active` | boolean | requerido | `true` |
| `created_at` | datetime | automático | — |
| `updated_at` | datetime | automático | — |

**Plus (Soft Delete):** Opcional: `deleted_at` (datetime, nullable). Listados y búsquedas excluyen registros con `deleted_at` presente.

### 3.2 Validaciones (estrictas)
- **name:** presence, length: { minimum: 3, maximum: 100 }
- **description:** length: { maximum: 1000 }, allow_blank: true
- **price:** presence, numericality: { greater_than: 0 }
- **stock:** presence, numericality: { only_integer: true, greater_than_or_equal_to: 0 }
- **sku:** presence, uniqueness: true, formato alfanumérico mayúsculas.
- **active:** inclusion: { in: [ true, false ] } o presence según convención.

### 3.3 Scopes
- `active` / `activos`: `where(active: true)`.
- Con soft delete: `without_deleted` → `where(deleted_at: nil)`.

---

## 4. Blueprints y Serializers (Especificación)

### 4.1 Ubicación y convención
- **Carpeta:** `app/blueprints/`.
- **Nomenclatura:** `ProductBlueprint`, `ErrorBlueprint` (sufijo `Blueprint`).
- Los controladores y, si aplica, los interactors que devuelvan datos para la API usarán estos blueprints para generar el JSON.

### 4.2 ProductBlueprint

Responsable de transformar uno o varios `Product` en JSON.

**Vista `:default` (detalle — GET :id, POST, PUT):**
- Incluir todos los campos expuestos al cliente: `id`, `name`, `description`, `price`, `stock`, `sku`, `active`, `created_at`, `updated_at`.
- **price:** serializar como string con 2 decimales (ej. `"19.99"`) para evitar problemas de precisión en clientes (o como número si el contrato lo define así).

**Vista `:list` (listado — GET /products):**
- Subconjunto para eficiencia: `id`, `name`, `price`, `sku`, `active` (y opcionalmente `stock` si se usa en listas). Excluir `description`, `created_at`, `updated_at` en esta vista para reducir tamaño y tiempo de serialización.

**Ejemplo de definición (Blueprinter):**
```ruby
# app/blueprints/product_blueprint.rb
class ProductBlueprint < Blueprinter::Base
  identifier :id

  fields :name, :description, :price, :stock, :sku, :active, :created_at, :updated_at

  field :price do |product|
    format('%.2f', product.price)
  end

  view :list do
    fields :name, :price, :sku, :active
    # id ya está vía identifier
  end
end
```

- En listado: `ProductBlueprint.render(products, view: :list)`.
- En detalle/creación/actualización: `ProductBlueprint.render(product)` (vista por defecto).

### 4.3 Estructura de respuesta de éxito (envuelta)

El controlador envuelve el resultado del blueprint en la estructura estándar:

- **Un recurso:** `{ "data": ProductBlueprint.render(product) }` (render devuelve hash; si Blueprinter devuelve ya un hash, usarlo como valor de `data`; si devuelve JSON string, parsear o usar `render_as_hash` si la gema lo ofrece).
- **Colección paginada:** `{ "data": ProductBlueprint.render(products, view: :list), "meta": { ... } }` donde `meta` contiene `current_page`, `per_page`, `total_pages`, `total_count` (según Pagy).

Nota: Blueprinter puede devolver hash o JSON; en Rails es habitual usar `render_as_hash` o el método que devuelva hash para luego hacer `{ data: ... }.to_json` y controlar orden y formato de fechas globalmente si hace falta.

### 4.4 ErrorBlueprint (opcional)

Para respuestas de error homogéneas:

- **Campos:** `code`, `message`, `details` (opcional, para 422).
- Uso: `ErrorBlueprint.render(error_object)` donde `error_object` es un objeto o hash con `code`, `message`, `details`. La respuesta HTTP sería `{ "error": ErrorBlueprint.render(...) }`.

Si no se usa blueprint para errores, se mantiene el hash fijo definido en §10.2.

---

## 5. Endpoints Requeridos

Base URL: `/api/v1`

### 5.1 Listado con búsqueda y filtrado
- **GET** `/api/v1/products`
  - **Query params:** `q` o `search` (nombre), `active` (boolean), `page`, `per_page`.
  - **Respuesta:** Lista paginada serializada con **ProductBlueprint vista `:list`**; estructura `{ "data": [...], "meta": { ... } }`.

### 5.2 Detalle
- **GET** `/api/v1/products/:id`
  - **Respuesta:** Un producto con **ProductBlueprint vista `:default`**; estructura `{ "data": { ... } }`. **404** si no existe (o soft-deleted según criterio).

### 5.3 Creación
- **POST** `/api/v1/products`
  - **Body:** JSON con atributos del producto.
  - **Lógica:** Interactor `Products::Create`.
  - **Respuesta:** 201 y cuerpo con **ProductBlueprint.render(product)** dentro de `data`. **422** con errores en formato estándar (o ErrorBlueprint).

### 5.4 Actualización
- **PUT** (o PATCH) `/api/v1/products/:id`
  - **Body:** JSON con atributos a actualizar.
  - **Lógica:** Interactor `Products::Update`.
  - **Respuesta:** 200 y **ProductBlueprint** (vista default) en `data`. **404** / **422** según caso.

### 5.5 Eliminación
- **DELETE** `/api/v1/products/:id`
  - **Lógica:** Interactor `Products::Destroy`.
  - **Comportamiento:** Borrado físico o soft delete (Plus). Respuesta 200/204; si hay body, puede ser `{ "data": null }` o mensaje. No usar blueprint de producto.

---

## 6. Infraestructura (Docker)

### 6.1 Dockerfile
- Base: `ruby` (ej. 3.2), dependencias para PostgreSQL (`libpq-dev`).
- Directorio de trabajo, copia de Gemfile/Gemfile.lock, `bundle install`, copia de la app, puerto expuesto (3000), comando por defecto para levantar Rails (`rails s -b 0.0.0.0`).

### 6.2 docker-compose.yml
- Servicios: **app** (build, depende de `db`), **db** (`postgres:15-alpine`, volumen, variables de entorno).
- Red interna para que `app` use host `db`.

### 6.3 database.yml
- Uso de **variables de entorno** para configuración (DATABASE_URL o POSTGRES_*). Sin credenciales en repo.

---

## 7. Estrategia de Testing (RSpec)

### 7.1 Tests de Modelo
- Validaciones y scopes (igual que en v1).

### 7.2 Tests de Blueprints
- **ProductBlueprint:**
  - Vista `:default`: incluye todos los campos definidos; `price` con formato esperado.
  - Vista `:list`: incluye solo los campos de la vista list; no incluye `description`, `created_at`, `updated_at`.
- **ErrorBlueprint** (si existe): que exponga `code`, `message`, y `details` cuando se pasen.

### 7.3 Request Specs (integración)
- GET list: listado vacío, con datos, paginación, búsqueda, filtro `active`; comprobar que el cuerpo usa la estructura `data` + `meta` y que cada ítem en `data` tiene solo los campos de la vista list.
- GET :id: éxito con estructura de detalle (todos los campos del blueprint default); 404 cuando corresponda.
- POST / PUT: 201/200 con `data` serializada como detalle; 404/422 con cuerpo de error estándar (o ErrorBlueprint).

### 7.4 Casos de Error
- 404 y 422 con formato de error acordado (§10.2 o ErrorBlueprint).

---

## 8. Estructura de Carpetas Relevante

```
product-backend/
├── app/
│   ├── blueprints/
│   │   ├── product_blueprint.rb
│   │   └── error_blueprint.rb          # opcional
│   ├── controllers/
│   │   └── api/
│   │       └── v1/
│   │           └── products_controller.rb
│   ├── interactors/
│   │   └── products/
│   │       ├── create.rb
│   │       ├── update.rb
│   │       └── destroy.rb
│   ├── models/
│   │   └── product.rb
│   └── ...
├── config/
│   ├── database.yml
│   ├── routes.rb
│   └── ...
├── spec/
│   ├── blueprints/
│   │   ├── product_blueprint_spec.rb
│   │   └── error_blueprint_spec.rb     # opcional
│   ├── models/
│   │   └── product_spec.rb
│   ├── requests/
│   │   └── api/
│   │       └── v1/
│   │           └── products_spec.rb
│   └── ...
├── Dockerfile
├── docker-compose.yml
├── Gemfile
└── ...
```

- **Blueprints** en `app/blueprints/`; un archivo por recurso (y opcionalmente `error_blueprint.rb`).
- **Interactors** en `app/interactors/products/` para Create, Update, Destroy.

---

## 9. Gemas Necesarias

### 9.1 Runtime
- **rails** (modo API).
- **pg**.
- **interactor**.
- **pagy** (o kaminari).
- **rack-cors**.
- **blueprinter** — serialización de objetos a JSON (blueprints y vistas).

### 9.2 Desarrollo / Test
- **rspec-rails**, **factory_bot_rails**, **faker** (opcional).

---

## 10. Guía de Configuración Paso a Paso (Docker)

1. Docker y Docker Compose instalados.
2. Proyecto en el directorio esperado.
3. Variables de entorno (`.env` o docker-compose): `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, etc.
4. `docker compose build`
5. `docker compose run --rm app bundle exec rails db:create db:migrate` (y `db:test:prepare` si aplica).
6. `docker compose up` → API en `http://localhost:3000`.
7. Verificación: `curl http://localhost:3000/api/v1/products`.
8. Tests: `docker compose run --rm app bundle exec rspec`.

---

## 11. Definición de Respuesta JSON Estándar

Todas las respuestas de éxito que devuelven recursos **Product** se generan mediante **ProductBlueprint**. La forma concreta del JSON es la definida por el blueprint (y por la vista usada).

### 11.1 Éxito — Un recurso (GET :id, POST, PUT)

Estructura: `{ "data": <hash generado por ProductBlueprint (vista default)> }`.

Ejemplo (el contenido de `data` lo define ProductBlueprint):
```json
{
  "data": {
    "id": 1,
    "name": "Product name",
    "description": "Optional description",
    "price": "19.99",
    "stock": 10,
    "sku": "SKU001",
    "active": true,
    "created_at": "2025-02-21T12:00:00.000Z",
    "updated_at": "2025-02-21T12:00:00.000Z"
  }
}
```

### 11.2 Éxito — Lista paginada (GET /products)

Estructura: `{ "data": <array generado por ProductBlueprint vista :list>, "meta": { ... } }`.

Ejemplo:
```json
{
  "data": [
    { "id": 1, "name": "...", "price": "19.99", "sku": "SKU001", "active": true }
  ],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total_pages": 1,
    "total_count": 1
  }
}
```

- **DELETE:** 204 sin body o 200 con `{ "data": null }` o mensaje; no usa ProductBlueprint.

### 11.3 Errores (hash fijo o ErrorBlueprint)

**404:**
```json
{
  "error": {
    "code": "not_found",
    "message": "Product not found"
  }
}
```

**422:**
```json
{
  "error": {
    "code": "validation_error",
    "message": "Validation failed",
    "details": {
      "name": ["can't be blank"],
      "sku": ["has already been taken"],
      "price": ["must be greater than 0"]
    }
  }
}
```

Si se implementa **ErrorBlueprint**, este mismo formato puede generarse con `ErrorBlueprint.render(...)` para mantener un solo lugar de verdad.

---

## 12. Resumen de Tareas

| # | Tarea |
|---|--------|
| 1 | Estructura de carpetas: `app/interactors`, `app/blueprints`, namespaces `api/v1`. |
| 2 | Gemas: interactor, pagy (o kaminari), rack-cors, **blueprinter**, rspec-rails (y factory_bot/faker si aplica). |
| 3 | Docker: Dockerfile, docker-compose, database.yml con variables de entorno; guía paso a paso. |
| 4 | Respuestas JSON estándar: éxito (recurso y lista) **generadas por Blueprints**; errores 404/422 (hash o ErrorBlueprint). |
| 5 | Implementar **ProductBlueprint** con vista `:default` (detalle) y vista `:list` (listado); opcional **ErrorBlueprint**. |
| 6 | Controladores: usar solo blueprints para serializar recursos Product; no construir hashes de respuesta a mano. |
| 7 | Tests: specs de blueprints (vistas default y list); request specs comprobando estructura y campos según blueprint. |

---
