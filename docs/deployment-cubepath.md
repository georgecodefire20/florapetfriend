# FloraPetFriend — Deployment Guide (CubePath / Coolify)

## Prerequisites
- CubePath account with a server (min. 4 CPU, 8GB RAM, 50GB SSD)
- Docker & Docker Compose installed on the server
- Domain `florapetfriend.site` at Hostinger (see hostinger-dns.md)

---

## Step 1 — Connect your server to CubePath

1. Log in at https://cubepath.com
2. Go to **Servers → Add Server**
3. Run the install command on your VPS:
   ```bash
   curl -fsSL https://cubepath.com/install.sh | bash
   ```
4. Copy the token shown and paste it in the CubePath UI
5. Wait for the server to appear as "Connected"

---

## Step 2 — Create a new Project

1. CubePath dashboard → **Projects → New Project**
2. Name: `florapetfriend`
3. Select your connected server

---

## Step 3 — Deploy each service

### 3.1 — PostgreSQL (Supabase DB)

1. **Add Resource → Database → PostgreSQL**
2. Name: `fpf-postgres`
3. Set environment:
   ```
   POSTGRES_PASSWORD=your_strong_password
   POSTGRES_DB=postgres
   ```
4. Click **Deploy**
5. Note the internal hostname: `fpf-postgres:5432`

---

### 3.2 — MinIO

1. **Add Resource → Docker Image**
2. Image: `minio/minio:latest`
3. Name: `fpf-minio`
4. Command: `server /data --console-address ":9001"`
5. Ports: `9000`, `9001`
6. Environment:
   ```
   MINIO_ROOT_USER=minioadmin
   MINIO_ROOT_PASSWORD=your_minio_password
   ```
7. Volume: `/data`
8. Domain: `storage.florapetfriend.site` → port `9001`
9. Click **Deploy**
10. Open MinIO console → create buckets: `pet-photos`, `virtual-pets` (set public)

---

### 3.3 — Ollama

1. **Add Resource → Docker Image**
2. Image: `ollama/ollama:latest`
3. Name: `fpf-ollama`
4. Port: `11434`
5. Volume: `/root/.ollama`
6. If GPU available, enable GPU passthrough in CubePath server settings
7. Click **Deploy**
8. After deploy, open terminal and pull models:
   ```bash
   docker exec fpf-ollama ollama pull llava:13b
   docker exec fpf-ollama ollama pull llama3.2
   ```

> ⚠️ `llava:13b` requires ~8GB VRAM or ~16GB RAM. Use `llava:7b` for less memory.

---

### 3.4 — n8n

1. **Add Resource → Docker Image**
2. Image: `n8nio/n8n:latest`
3. Name: `fpf-n8n`
4. Port: `5678`
5. Domain: `n8n.florapetfriend.site`
6. Environment:
   ```
   N8N_HOST=n8n.florapetfriend.site
   N8N_PROTOCOL=https
   WEBHOOK_URL=https://n8n.florapetfriend.site
   N8N_BASIC_AUTH_ACTIVE=true
   N8N_BASIC_AUTH_USER=admin
   N8N_BASIC_AUTH_PASSWORD=your_password
   DB_TYPE=postgresdb
   DB_POSTGRESDB_HOST=fpf-postgres
   DB_POSTGRESDB_PORT=5432
   DB_POSTGRESDB_DATABASE=n8n
   DB_POSTGRESDB_USER=postgres
   DB_POSTGRESDB_PASSWORD=your_strong_password
   N8N_ENCRYPTION_KEY=32_char_random_key
   ```
7. Click **Deploy**
8. Open n8n UI → **Import workflow** → upload `n8n/workflows/reminder-workflow.json`
9. Add PostgreSQL credential pointing to `fpf-postgres`
10. Activate the workflow

---

### 3.5 — NocoDB (Admin Panel)

1. **Add Resource → Docker Image**
2. Image: `nocodb/nocodb:latest`
3. Name: `fpf-nocodb`
4. Port: `8080`
5. Domain: `admin.florapetfriend.site`
6. Environment:
   ```
   NC_DB=pg://fpf-postgres:5432?u=postgres&p=your_password&d=postgres
   NC_AUTH_JWT_SECRET=your_jwt_secret
   ```
7. Click **Deploy**
8. Open admin panel → **Connect database** → select existing PostgreSQL

---

### 3.6 — Next.js Frontend

Option A — Deploy from Git (recommended):
1. **Add Resource → Application → From Git**
2. Connect your GitHub/GitLab repo
3. Root: `/frontend`
4. Build command: `npm run build`
5. Start command: `node server.js`
6. Port: `3000`
7. Domain: `florapetfriend.site` AND `app.florapetfriend.site`

Option B — Deploy from Docker image:
1. **Add Resource → Docker Image**
2. Build locally: `docker build -t fpf-frontend ./frontend`
3. Push to registry, use image name in CubePath

**Environment variables** (set in CubePath):
```
NEXT_PUBLIC_SUPABASE_URL=http://fpf-supabase-kong:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OLLAMA_BASE_URL=http://fpf-ollama:11434
OLLAMA_MODEL=llava:13b
MINIO_ENDPOINT=fpf-minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=your_minio_password
MINIO_USE_SSL=false
N8N_WEBHOOK_URL=https://n8n.florapetfriend.site/webhook
NEXT_PUBLIC_APP_URL=https://florapetfriend.site
```

---

## Step 4 — Initialize the Database

1. Open CubePath → `fpf-postgres` → **Terminal**
2. Connect to psql:
   ```bash
   psql -U postgres
   ```
3. Run the migration:
   ```bash
   \i /migrations/001_initial.sql
   ```
   OR copy-paste the contents of `supabase/migrations/001_initial.sql`

---

## Step 5 — Enable HTTPS

CubePath / Coolify handles SSL automatically via Let's Encrypt.

1. For each service with a domain, go to **Settings → HTTPS**
2. Enable **Force HTTPS**
3. CubePath will provision and renew certificates automatically

---

## Step 6 — Verify all services

| Service  | URL                                    | Expected          |
|---------|----------------------------------------|-------------------|
| Frontend | https://florapetfriend.site            | Landing page      |
| MinIO   | https://storage.florapetfriend.site    | MinIO console     |
| n8n     | https://n8n.florapetfriend.site        | n8n login         |
| NocoDB  | https://admin.florapetfriend.site      | Admin login       |
| Ollama  | Internal only (fpf-ollama:11434)       | Not public-facing |

---

## Step 7 — Scaling

- **Ollama**: Use a GPU-enabled server (NVIDIA A10 or better)
- **Frontend**: Enable **replicas** in CubePath for horizontal scaling
- **PostgreSQL**: Enable daily backups in CubePath → Database → Backup
- **MinIO**: Add storage nodes for distributed mode when > 1TB
