# Especificación de Software Detallada
## Enfoque: Spec Driven Development (SDD)
### Módulo: Historial de auditoría de producto (frontend)

**Versión:** 1.0  
**Fecha:** 2026-02-22  
**Rol:** Senior Frontend Developer

---

## 1. Contexto del Proyecto

| Atributo | Valor |
|----------|--------|
| **Nombre** | product-frontend — Módulo Historial de auditoría |
| **Objetivo** | Exponer en la interfaz el historial de cambios (auditoría) de cada producto, consumiendo el endpoint de auditoría del backend. |
| **API de referencia** | `GET /api/v1/products/:id/audits`; contrato alineado a `docs/spec-product-backend.md` (§5.6, §11.3) y al backend existente. |

### 1.1 Alcance

- Acción **History** en el menú de acciones por producto (junto a Edit y Delete), tanto en vista tabla como en vista tarjetas.
- Modal que muestra el historial de auditoría del producto seleccionado: tabla con columnas Action, Changes y Date.
- Estados de UI explícitos: Loading, Empty y Error, coherentes con el resto del frontend (§4.4 de `docs/spec-product-frontend.md`).
- Tipado TypeScript y capa de servicios alineados al contrato de la API; hook opcional con React Query para caché e invalidación.

---

## 2. Contrato de la API

### 2.1 Request

| Aspecto | Especificación |
|---------|----------------|
| **Método** | GET |
| **Ruta** | `/api/v1/products/:id/audits` |
| **Parámetro de ruta** | `id` (number) — identificador del producto. |

### 2.2 Response (200)

Estructura estándar: `{ "data": [ ... ] }`. Cada elemento del array es un registro de auditoría con la siguiente forma:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | number | Identificador del registro de auditoría. |
| `action` | string | Tipo de acción: `"create"`, `"update"`, `"destroy"`, u otros según backend. |
| `changes` | object | Atributos del producto en el momento del cambio; valores pueden ser string, number, boolean o null. |
| `created_at` | string | Fecha y hora del cambio (ISO 8601 o formato "YYYY-MM-DD HH:mm:ss UTC"). |

Ejemplo de cuerpo de respuesta:

```json
{
  "data": [
    {
      "id": 33,
      "action": "create",
      "changes": {
        "name": "Product E",
        "description": null,
        "price": "10.0",
        "stock": 2,
        "sku": "SKU006",
        "active": true,
        "deleted_at": null
      },
      "created_at": "2026-02-22 22:07:48 UTC"
    }
  ]
}
```

**Errores:** 404 cuando el producto no existe; 5xx según definición del backend. El frontend debe tratar estos códigos de forma coherente con el resto de la capa de servicios (§3.4 de `docs/spec-product-frontend.md`).

---

## 3. Requerimientos de Funcionalidad

### 3.1 Acceso desde el listado

- En el menú de acciones por producto (dropdown en tabla y en tarjetas) se incluirá una opción **History**, con icono (por ejemplo History o ScrollText de lucide-react).
- Al activar dicha opción se abrirá un modal que muestra el historial de auditoría del producto correspondiente.
- El comportamiento será idéntico en vista tabla (desktop) y vista tarjetas (mobile): misma opción de menú y mismo modal.

### 3.2 Contenido del modal de historial

- **Título:** Incluir el nombre del producto para contexto (por ejemplo: "History: {product name}").
- **Tabla:** Tres columnas:
  - **Action:** valor del campo `action` (create, update, destroy, etc.); se podrá representar mediante badge o texto normal.
  - **Changes:** representación legible del objeto `changes` (pares clave–valor; texto preformateado o fila expandible según criterio de UX).
  - **Date:** fecha y hora formateada a partir de `created_at` (locale del usuario o formato consistente).
- **Estados:**
  - **Loading:** mientras se cargan los registros de auditoría, mostrar skeleton o spinner dentro del modal.
  - **Empty:** cuando la respuesta tenga `data` vacío, mostrar el mensaje "No changes recorded." (o equivalente definido en copy).
  - **Error:** cuando la petición falle (404, 5xx, fallo de red), mostrar mensaje de error y opción de reintentar (botón Retry).
- **Cierre:** control estándar de cierre del modal (botón X o equivalente), coherente con el resto de la aplicación.

### 3.3 Integración técnica

- **Tipos TypeScript:** Definir interfaces para la respuesta de auditoría (por ejemplo `ProductAudit`, `ProductAuditChanges`, `ProductAuditListResponse`) en `types/product.ts` (o módulo dedicado), alineadas al JSON descrito en §2.2.
- **Servicio:** Función `fetchProductAudits(productId: number)` en `services/products.ts` que invoque `GET /api/v1/products/:id/audits` y devuelva datos tipados; manejo de errores según la convención existente de la capa de servicios.
- **Modo mock:** Cuando no exista `NEXT_PUBLIC_API_BASE_URL`, la función podrá devolver `{ data: [] }` (o datos fixture) para desarrollo sin backend.
- **Hook:** `useProductAudits(productId)` con `useQuery`, habilitado cuando el modal esté abierto y `productId` sea válido; `queryKey` por ejemplo `['product-audits', productId]`.
- **Componente:** Modal reutilizable (por ejemplo `AuditHistoryModal`) que reciba `product` (o `productId` y nombre del producto), `open`, `onOpenChange`, y consuma el hook o el servicio para cargar y mostrar la tabla.

---

## 4. UI/UX

- La opción del menú se denomina **History** y utilizará un icono acorde (lucide-react).
- La tabla del modal debe ser legible en desktop y admitir scroll horizontal en pantallas pequeñas cuando sea necesario.
- La columna **Changes** se presentará como texto preformateado (clave: valor por línea) o en formato que permita leer los campos principales (name, price, sku, etc.) sin sobrecargar la celda.

---

## 5. Resumen de Tareas del SDD

| # | Tarea |
|---|--------|
| 1 | Definir tipos `ProductAudit`, `ProductAuditChanges`, `ProductAuditListResponse` en `types/product.ts` (o módulo dedicado). Ver §3.3. |
| 2 | Implementar `fetchProductAudits(productId: number)` en `services/products.ts`; manejo de 404 y errores; mock cuando no haya API base. Ver §3.3. |
| 3 | Crear componente `AuditHistoryModal`: Dialog con tabla (Action, Changes, Date); estados Loading, Empty, Error; título con nombre del producto. Ver §3.2, §4. |
| 4 | Añadir opción "History" en el menú de acciones de `ProductTable` y `ProductCardList`; callback `onHistory(product)`. Ver §3.1. |
| 5 | En `ProductsPage`, estado para el producto seleccionado para historial y control de apertura/cierre del modal; pasar handlers a tabla y tarjetas. Ver §3.3. |
| 6 | (Opcional) Hook `useProductAudits(productId)` con `useQuery`; tests para servicio y componente. Ver §3.3, §9 de `docs/spec-product-frontend.md`. |

---

## 6. Referencias

- **Backend — Auditoría:** `docs/spec-product-backend.md` (§3.4 Trazabilidad de cambios, §4.5 AuditBlueprint, §5.6 GET /products/:id/audits, §11.3).
- **Frontend base:** `docs/spec-product-frontend.md` (integración API §3, servicios §3.4, tipos §3.3, estados de UI §4.4, testing §9).

---
