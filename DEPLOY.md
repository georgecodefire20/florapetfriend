# FloraPetFriend — Despliegue en CubePath.com

> **Este archivo es la guía oficial de producción.**
> No necesitas Node.js ni Docker local. Todo se despliega desde CubePath.

---

## Requisitos previos

1. Cuenta activa en https://cubepath.com
2. Repositorio Git (GitHub / GitLab) con este código
3. Dominio `florapetfriend.site` en Hostinger apuntando a tu servidor

---

## PASO 1 — Subir el código a GitHub

Crea un repositorio en GitHub y sube el proyecto:

```bash
git init
git add .
git commit -m "Initial commit - FloraPetFriend"
git remote add origin https://github.com/TU_USUARIO/florapetfriend
git push -u origin main
```

---

## PASO 2 — Configurar servidor en CubePath

1. Entra en https://cubepath.com → **Servers → Add New Server**
2. Elige un servidor VPS con mínimo:
   - **4 vCPU / 8 GB RAM / 80 GB SSD**
   - Sistema operativo: Ubuntu 22.04
3. Ejecuta el comando de instalación que te da CubePath en tu VPS:
   ```bash
   curl -fsSL https://cubepath.com/install.sh | bash -s -- --token=TU_TOKEN
   ```
4. El servidor aparece como **Online** en el dashboard

---

## PASO 3 — Crear Proyecto en CubePath

1. Dashboard → **Projects → New Project**
2. Nombre: `florapetfriend`
3. Selecciona tu servidor

---

## PASO 4 — Desplegar servicios (en este orden)

### 4.1 Base de datos — Supabase

Tienes **dos opciones**. La Opción A es la más sencilla:

#### ✅ OPCIÓN A — Supabase Cloud (recomendado)

1. Ve a https://supabase.com → **New Project**
2. Nombre: `florapetfriend`, elige la región más cercana
3. Copia el **Project URL** y las claves desde **Settings → API**:
   - `NEXT_PUBLIC_SUPABASE_URL` → URL del proyecto (ej: `https://abcdefgh.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `anon` `public` key
   - `SUPABASE_SERVICE_ROLE_KEY` → `service_role` key (secreta)
4. Ve a **SQL Editor** y ejecuta el contenido de `supabase/migrations/001_initial.sql`

> Con Supabase Cloud **no necesitas desplegar PostgreSQL en CubePath**. Pasa directamente al paso 4.2.

---

#### OPCIÓN B — PostgreSQL self-hosted en CubePath

Solo si prefieres no usar Supabase Cloud:

| Campo | Valor |
|-------|-------|
| Tipo | **Database → PostgreSQL** |
| Nombre | `fpf-postgres` |
| Versión | 15 |

Variables:
```
POSTGRES_PASSWORD=TU_PASSWORD_SEGURO
POSTGRES_DB=postgres
POSTGRES_USER=postgres
```

→ Después del deploy, abre la terminal del contenedor y ejecuta el SQL de `supabase/migrations/001_initial.sql`.  
→ Usa `NEXT_PUBLIC_SUPABASE_URL=http://fpf-postgres:5432` **solo si tienes también Kong API gateway desplegado**.

---

### 4.2 MinIO (almacenamiento de fotos)

| Campo | Valor |
|-------|-------|
| Tipo | **Docker Image** |
| Imagen | `minio/minio:latest` |
| Nombre | `fpf-minio` |
| Command | `server /data --console-address ":9001"` |
| Puerto interno | `9000` |
| Dominio | `storage.florapetfriend.site` → puerto `9001` |
| Volumen | `/data` |

Variables de entorno:
```
MINIO_ROOT_USER=fpf_admin
MINIO_ROOT_PASSWORD=TU_PASSWORD_MINIO
```

→ Click **Deploy**

Después del deploy, abre `https://storage.florapetfriend.site`:
- Crea el bucket `pet-photos` → Acceso: **Public**
- Crea el bucket `virtual-pets` → Acceso: **Public**

---

### 4.3 Ollama (motor de IA)

| Campo | Valor |
|-------|-------|
| Tipo | **Docker Image** |
| Imagen | `ollama/ollama:latest` |
| Nombre | `fpf-ollama` |
| Puerto interno | `11434` |
| Sin dominio público | (solo acceso interno) |
| Volumen | `/root/.ollama` |

→ Click **Deploy**

Después del deploy, abre la terminal del contenedor en CubePath y ejecuta:
```bash
ollama pull llava:13b
ollama pull llama3.2
```

> Si el servidor tiene menos de 16 GB RAM, usa `ollama pull llava:7b` en su lugar y actualiza la variable `OLLAMA_MODEL=llava:7b` en el frontend.

---

### 4.4 n8n (automatización de recordatorios)

| Campo | Valor |
|-------|-------|
| Tipo | **Docker Image** |
| Imagen | `n8nio/n8n:latest` |
| Nombre | `fpf-n8n` |
| Puerto interno | `5678` |
| Dominio | `n8n.florapetfriend.site` |
| Volumen | `/home/node/.n8n` |

Variables de entorno:
```
N8N_HOST=n8n.florapetfriend.site
N8N_PORT=5678
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.florapetfriend.site
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=TU_PASSWORD_N8N
N8N_ENCRYPTION_KEY=CLAVE_ALEATORIA_32_CARACTERES

# Si usas Supabase Cloud (Opción A): conecta n8n a la misma BD
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=db.TU_PROJECT_ID.supabase.co
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=postgres
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=TU_SUPABASE_DB_PASSWORD
DB_POSTGRESDB_SSL_REJECT_UNAUTHORIZED=false

# Si usas PostgreSQL self-hosted (Opción B):
# DB_POSTGRESDB_HOST=fpf-postgres
# DB_POSTGRESDB_DATABASE=n8n
```

→ Click **Deploy**

Después:
1. Abre `https://n8n.florapetfriend.site`
2. **Import Workflow** → sube el archivo `n8n/workflows/reminder-workflow.json`
3. Configura credencial PostgreSQL apuntando a la misma BD que el frontend
4. Activa el workflow

---

### 4.5 NocoDB (panel de administración)

| Campo | Valor |
|-------|-------|
| Tipo | **Docker Image** |
| Imagen | `nocodb/nocodb:latest` |
| Nombre | `fpf-nocodb` |
| Puerto interno | `8080` |
| Dominio | `admin.florapetfriend.site` |
| Volumen | `/usr/app/data` |

Variables de entorno:
```
# Si usas Supabase Cloud (Opción A):
# La URL de conexión directa la encuentras en Supabase → Settings → Database → Connection string (URI)
NC_DB=pg://db.TU_PROJECT_ID.supabase.co:5432?u=postgres&p=TU_DB_PASSWORD&d=postgres

# Si usas PostgreSQL self-hosted en CubePath (Opción B):
# NC_DB=pg://fpf-postgres:5432?u=postgres&p=TU_PASSWORD_SEGURO&d=postgres

NC_AUTH_JWT_SECRET=SECRETO_JWT_ALEATORIO
```

→ Click **Deploy**

---

### 4.6 Frontend Next.js ← EL MÁS IMPORTANTE

| Campo | Valor |
|-------|-------|
| Tipo | **Application → From Git Repository** |
| Repositorio | tu repo de GitHub/GitLab |
| Branch | `main` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Start Command | `node server.js` |
| Puerto | `3000` |
| Dominio 1 | `florapetfriend.site` |
| Dominio 2 | `www.florapetfriend.site` |

Variables de entorno en CubePath (NO en .env local):
```
# Si usas Supabase Cloud (Opción A del paso 4.1):
NEXT_PUBLIC_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
# Si usas self-hosted (Opción B): http://fpf-supabase-kong:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY_SUPABASE
SUPABASE_SERVICE_ROLE_KEY=TU_SERVICE_ROLE_KEY
OLLAMA_BASE_URL=http://fpf-ollama:11434
OLLAMA_MODEL=llava:13b
MINIO_ENDPOINT=fpf-minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=fpf_admin
MINIO_SECRET_KEY=TU_PASSWORD_MINIO
MINIO_USE_SSL=false
MINIO_BUCKET_PETS=pet-photos
MINIO_BUCKET_AVATARS=virtual-pets
N8N_WEBHOOK_URL=https://n8n.florapetfriend.site/webhook
NEXT_PUBLIC_APP_URL=https://florapetfriend.site
NODE_ENV=production
```

→ Click **Deploy**

---

## PASO 5 — Inicializar la base de datos

**Si usaste Supabase Cloud (Opción A):**
1. Abre https://supabase.com → tu proyecto → **SQL Editor**
2. Pega el contenido completo de `supabase/migrations/001_initial.sql`
3. Click **Run**

**Si usaste PostgreSQL self-hosted en CubePath (Opción B):**
1. CubePath → `fpf-postgres` → **Terminal**
2. Pega el contenido de `supabase/migrations/001_initial.sql` directamente en el terminal SQL

---

## PASO 6 — Configurar DNS en Hostinger

Entra en https://hpanel.hostinger.com → **Dominios → florapetfriend.site → DNS**

Añade estos registros (reemplaza `IP_DE_TU_SERVIDOR` con la IP de CubePath):

| Tipo | Nombre  | Valor                | TTL  |
|------|---------|----------------------|------|
| A    | @       | IP_DE_TU_SERVIDOR    | 3600 |
| A    | www     | IP_DE_TU_SERVIDOR    | 3600 |
| A    | storage | IP_DE_TU_SERVIDOR    | 3600 |
| A    | n8n     | IP_DE_TU_SERVIDOR    | 3600 |
| A    | admin   | IP_DE_TU_SERVIDOR    | 3600 |

Espera 5-30 minutos para que propague.

---

## PASO 7 — Activar HTTPS

CubePath genera certificados SSL automáticamente con Let's Encrypt.

Para cada servicio con dominio:
1. CubePath → Servicio → **Domains**
2. Clic en **Generate SSL**
3. Activa **Force HTTPS**

---

## PASO 8 — Verificar que todo funciona

| URL | Qué debe mostrar |
|-----|-----------------|
| https://florapetfriend.site | Landing page con animaciones |
| https://florapetfriend.site/identify | Formulario de identificación |
| https://storage.florapetfriend.site | Consola MinIO |
| https://n8n.florapetfriend.site | Login n8n |
| https://admin.florapetfriend.site | Panel NocoDB |

---

## Flujo completo de prueba

1. Abre `https://florapetfriend.site/identify`
2. Sube una foto de un gato o escribe "gato persa"
3. Deben aparecer hasta 3 tarjetas de especies
4. Clic en "Ver ficha completa"
5. Clic en "Crear mascota virtual"
6. Ve a `https://florapetfriend.site/pets` — debe aparecer la mascota
7. Ve a `https://florapetfriend.site/reminders` — deben aparecer recordatorios

---

## Subdominios del proyecto

| Servicio | URL |
|---------|-----|
| App principal | https://florapetfriend.site |
| Almacenamiento | https://storage.florapetfriend.site |
| Automatización | https://n8n.florapetfriend.site |
| Panel admin | https://admin.florapetfriend.site |
