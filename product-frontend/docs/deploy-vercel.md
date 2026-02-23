# Publicar product-frontend en Vercel

Guía para desplegar el frontend Next.js en [Vercel](https://vercel.com) usando el backend público en Railway.

## Requisitos

- Cuenta en [Vercel](https://vercel.com) (puedes usar GitHub para registrarte).
- Repositorio del proyecto en **GitHub** (recomendado).
- Backend ya desplegado y accesible (p. ej. en Railway). URL pública usada en esta guía: `https://product-app-production-e218.up.railway.app`.

---

## Opción A: Desplegar desde GitHub (recomendado)

### 1. Importar el repositorio

1. Entra en [vercel.com/new](https://vercel.com/new).
2. Conecta tu cuenta de GitHub si no lo has hecho e **Import** el repositorio **product-app** (o el que contenga el frontend).

### 2. Configurar el proyecto (monorepo)

Si el repo tiene la estructura **product-app** (raíz) con **product-frontend/** dentro:

1. En la pantalla de configuración del proyecto, en **Root Directory** haz clic en **Edit**.
2. Escribe: **`product-frontend`** y confirma.
3. **Framework Preset** debería detectarse como Next.js. Build Command: `next build` (o dejarlo por defecto). Output: estándar de Next.js.

### 3. Variables de entorno

En **Environment Variables** añade al menos:

| Variable | Valor | Entorno |
| -------- | ----- | ------- |
| `NEXT_PUBLIC_API_BASE_URL` | `https://product-app-production-e218.up.railway.app` | Production, Preview (y Development si quieres) |

- **Sin `/` final** en la URL (el frontend concatena rutas como `/api/v1/products`).
- Opcionales: `NEXT_PUBLIC_API_TIMEOUT`, `NEXT_PUBLIC_DEFAULT_PER_PAGE`, etc. (ver `product-frontend/README.md`).

Si tu backend está en otra URL, sustituye por esa URL (sin barra final).

### 4. Desplegar

1. Pulsa **Deploy**.
2. Vercel construye y publica el frontend. Te dará una URL tipo `https://product-frontend-xxx.vercel.app` (o tu dominio personalizado si lo configuraste).

### 5. Probar

Abre la URL del deploy. La app debería cargar productos desde el backend en Railway. Si ves datos y puedes crear/editar/eliminar, el flujo frontend (Vercel) → backend (Railway) está correcto.

---

## Opción B: Deploy con Vercel CLI

1. Instala la CLI: `pnpm add -g vercel` (o `npm i -g vercel`).
2. En la carpeta del frontend:
   ```bash
   cd product-frontend
   vercel
   ```
3. Sigue las preguntas (link to existing project o crear uno nuevo).
4. Configura la variable en el dashboard de Vercel (Project → Settings → Environment Variables) o con:
   ```bash
   vercel env add NEXT_PUBLIC_API_BASE_URL production
   ```
   Valor: `https://product-app-production-e218.up.railway.app`
5. Vuelve a desplegar: `vercel --prod`.

---

## CORS

El backend en Railway (`product-backend`) tiene CORS configurado para aceptar cualquier origen (`origins "*"` en `config/initializers/cors.rb`). No hace falta cambiar nada en el backend para que el frontend en Vercel pueda llamar a la API.

Si en el futuro restringes orígenes en el backend, añade el dominio de Vercel (p. ej. `https://tu-app.vercel.app`).

---

## Resumen rápido

| Paso | Dónde | Qué hacer |
| -----| ----- | --------- |
| 1 | vercel.com/new | Import repo desde GitHub |
| 2 | Project settings | Root Directory = `product-frontend` (si es monorepo) |
| 3 | Environment Variables | `NEXT_PUBLIC_API_BASE_URL` = `https://product-app-production-e218.up.railway.app` |
| 4 | Deploy | Deploy y probar la URL generada |

---

## Referencias

- [Deploy Next.js on Vercel](https://nextjs.org/docs/deployment#vercel)
- [Vercel – Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Monorepos on Vercel](https://vercel.com/docs/monorepos)
