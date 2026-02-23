# Publicar product-backend en Railway

Guía paso a paso para desplegar el backend Rails (API + PostgreSQL) en **Railway**.

## Requisitos

- Cuenta en [Railway](https://railway.com/) (puedes usar GitHub para registrarte).
- Repositorio del proyecto en **GitHub** (recomendado) o uso de la CLI.
- Contenido de `config/master.key` de tu app (para producción).

---

## Opción A: Desplegar desde GitHub (recomendado)

### 1. Crear proyecto y conectar el repo

1. Entra en [railway.com/new](https://railway.com/new).
2. Elige **Deploy from GitHub repo**.
3. Conecta tu cuenta de GitHub si aún no lo has hecho y selecciona el repositorio **product-app** (o el que contenga el backend).

### 2. Configurar el servicio del backend (monorepo)

Si tu repo tiene la estructura `product-app` (raíz) con `product-backend/` dentro:

1. En Railway, en el **servicio** que se creó para el repo, entra en **Settings**.
2. En **Build**, busca **Root Directory** (o "Source" / "Watch Paths" según la UI).
3. Escribe: **`product-backend`** y guarda.  
   Así Railway solo usará esa carpeta para construir y desplegar.

Si tu repo es **solo** el backend (la raíz es `product-backend`), no hace falta Root Directory.

### 3. Añadir PostgreSQL

1. En el **proyecto** de Railway, pulsa **+ New**.
2. Elige **Database** → **PostgreSQL** (Add PostgreSQL).
3. Se creará un servicio Postgres. Railway le asigna variables como `DATABASE_URL` (o `DATABASE_PUBLIC_URL`).

### 4. Variables de entorno del backend

En el **servicio de tu app** (no en el de Postgres):

1. Ve a **Variables**.
2. Añade:

| Variable           | Valor |
|--------------------|--------|
| `RAILS_MASTER_KEY` | Contenido de `product-backend/config/master.key` |
| `RAILS_ENV`        | `production` |
| `DATABASE_URL`     | `${{Postgres.DATABASE_PUBLIC_URL}}` (referencia al servicio Postgres; el nombre puede ser `Postgres` o el que tenga tu servicio). |

Para `DATABASE_URL` en Railway suele usarse la referencia a la variable del servicio Postgres, por ejemplo:

- `${{Postgres.DATABASE_PUBLIC_URL}}`  
o, según cómo se llame el servicio de base de datos:

- `${{NOMBRE_SERVICIO_POSTGRES.DATABASE_PUBLIC_URL}}`

Puedes elegir la variable desde el desplegable de referencias al crear/editar la variable.

### 5. Comando de arranque (migraciones + servidor)

Si usas el **Dockerfile** del repo, la imagen ya arranca en el `PORT` que asigna Railway (no hace falta Custom Start Command). Si usas **Nixpacks** (sin Dockerfile), configura:

1. En el **servicio de la app**, ve a **Settings** → sección **Deploy** (o **Build & Deploy**).
2. En **Custom Start Command** (o "Start Command") pon:

```bash
bin/rails db:prepare && bundle exec puma -C config/puma.rb
```

- `db:prepare`: crea la base si no existe y ejecuta migraciones.
- Puma usa el `PORT` que Railway asigna.

Guarda los cambios.

### 6. Dominio público

1. En el **servicio de la app**, ve a **Settings** → **Networking** (o pestaña **Networking**).
2. Pulsa **Generate Domain** (o "Add domain").  
3. Te darán una URL tipo `https://product-backend-production-xxxx.up.railway.app`.

### 7. Redesplegar

1. En el servicio, **Deploy** → **Redeploy** (o haz un nuevo push al repo si tienes deploy automático).
2. Revisa **Logs** para confirmar que arranca sin errores.

### 8. Probar la API

```bash
curl https://TU-DOMINIO.up.railway.app/api/v1/products
```

---

## Opción B: Desplegar con la CLI

Si prefieres no usar GitHub:

1. Instala la CLI: [docs.railway.com/guides/cli](https://docs.railway.com/guides/cli).
2. Inicia sesión:

   ```bash
   railway login
   ```

3. En la carpeta del backend:

   ```bash
   cd product-backend
   railway init
   ```

   Crea un proyecto nuevo o enlaza uno existente.

4. Añade Postgres al proyecto (desde la raíz del repo o desde `product-backend` según cómo tengas el proyecto en Railway):

   ```bash
   railway add
   ```

   Elige **PostgreSQL**.

5. Configura variables (sustituye `TU_MASTER_KEY` por el contenido de `config/master.key`):

   ```bash
   railway variables set RAILS_MASTER_KEY=TU_MASTER_KEY
   railway variables set RAILS_ENV=production
   railway variables set DATABASE_URL='${{Postgres.DATABASE_PUBLIC_URL}}'
   ```

   (En CLI a veces la referencia a Postgres se hace desde el dashboard; si no funciona, pon `DATABASE_URL` desde la web.)

6. Despliega:

   ```bash
   railway up
   ```

7. En el **dashboard** de Railway, en el servicio de la app, configura **Root Directory** = `product-backend` si estás en un monorepo, **Custom Start Command** como arriba, y **Generate Domain**.

---

## Resumen rápido (desde GitHub)

| Paso | Dónde | Qué hacer |
|------|--------|-----------|
| 1 | Railway → New Project | Deploy from GitHub repo → elegir repo |
| 2 | Servicio app → Settings | Root Directory = `product-backend` (si es monorepo) |
| 3 | Proyecto → + New | Database → PostgreSQL |
| 4 | Servicio app → Variables | `RAILS_MASTER_KEY`, `RAILS_ENV=production`, `DATABASE_URL=${{Postgres.DATABASE_PUBLIC_URL}}` |
| 5 | Servicio app → Settings → Deploy | Custom Start Command = `bin/rails db:prepare && bundle exec puma -C config/puma.rb` |
| 6 | Servicio app → Networking | Generate Domain |
| 7 | Redeploy y revisar logs | Probar `GET /api/v1/products` |

---

## Notas

- **Railway y Docker:** Si en la raíz de `product-backend` hay un `Dockerfile`, Railway puede usarlo. La imagen actual **respeta la variable `PORT`** que Railway asigna: si `PORT` está definida, arranca Puma en ese puerto; si no (p. ej. `docker run` local), usa Thruster en el puerto 80. Así se evita el error 502 por escuchar en un puerto distinto al que espera el proxy.
- **502 / "Starting Container":** Si antes veías 502 o el contenedor se quedaba en "Starting Container", era porque el Dockerfile arrancaba en el puerto 80 y Railway reenvía al puerto que inyecta en `PORT`. Con el cambio anterior ya no hace falta configurar Custom Start Command cuando usas el Dockerfile (aunque puedes hacerlo si quieres).
- Si el Dockerfile falla (p. ej. por `vendor/`), en **Settings → Build** puedes desactivar el uso del Dockerfile para que Railway use **Nixpacks** (detección automática de Rails) y sí configurar el Custom Start Command de la sección 5.
- **Credits / plan:** Railway tiene un período de prueba y luego plan de pago; revisa la web para precios actuales.
- **CORS:** Si luego usas un frontend en otro dominio (p. ej. Vercel), configura CORS en `config/initializers/cors.rb` para ese origen.

---

## Referencias

- [Deploy a Ruby on Rails App | Railway](https://docs.railway.com/guides/rails)
- [PostgreSQL en Railway](https://docs.railway.com/databases/postgresql)
- [Variables y referencias entre servicios](https://docs.railway.com/variables#referencing-another-services-variable)
