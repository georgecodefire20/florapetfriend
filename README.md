# 🌿🐾 FloraPetFriend

> Identifica animales y plantas con IA, crea tu mascota virtual educativa y recibe recordatorios automáticos de cuidado.

**Dominio:** https://florapetfriend.site  
**Stack:** Next.js · Supabase · Ollama (LLaVA) · MinIO · n8n · NocoDB · Docker

---

## Estructura del Proyecto

```
florapetfriend.site/
├── frontend/               # Next.js 14 App Router
│   ├── app/
│   │   ├── page.tsx               # Landing page
│   │   ├── layout.tsx             # Root layout + Navbar
│   │   ├── identify/
│   │   │   ├── page.tsx           # Formulario de identificación
│   │   │   └── results/page.tsx   # Slider de resultados
│   │   ├── species/[id]/page.tsx  # Ficha detallada de especie
│   │   ├── pets/page.tsx          # Mis mascotas virtuales
│   │   ├── reminders/page.tsx     # Recordatorios
│   │   ├── explore/page.tsx       # Explorar catálogo
│   │   └── api/
│   │       ├── identify/route.ts       # POST: imagen o texto → especies
│   │       ├── species/[id]/route.ts   # GET: ficha de especie
│   │       ├── virtual-pet/route.ts    # POST/GET: mascotas virtuales
│   │       └── reminders/route.ts      # GET/PATCH: recordatorios
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── IdentifyForm.tsx        # Upload imagen / texto
│   │   ├── SpeciesCard.tsx         # Tarjeta de especie con badge legal
│   │   ├── VirtualPet.tsx          # Componente mascota virtual
│   │   ├── WarningBanner.tsx       # Alerta roja para especies ilegales
│   │   └── ReminderCard.tsx        # Tarjeta de recordatorio con toggle
│   ├── lib/
│   │   ├── supabase.ts             # Client + tipos de DB
│   │   ├── ollama.ts               # Funciones IA (LLaVA + Llama3.2)
│   │   └── utils.ts                # Helpers (cn, getSeason, slugify…)
│   ├── Dockerfile
│   ├── .env.local.example
│   └── package.json
├── supabase/
│   └── migrations/001_initial.sql  # Schema completo + seed
├── n8n/
│   └── workflows/
│       └── reminder-workflow.json  # Workflow de recordatorios automáticos
├── docker/
│   ├── docker-compose.yml          # Todos los servicios
│   └── .env.example                # Variables de entorno
└── docs/
    ├── architecture.md             # Diagrama del sistema + flujos
    ├── deployment-cubepath.md      # Guía paso a paso en CubePath
    └── hostinger-dns.md            # Configuración DNS en Hostinger
```

---

## Despliegue en Producción — CubePath.com

Este proyecto está diseñado para desplegarse en **[CubePath.com](https://cubepath.com)** con el dominio `florapetfriend.site`.

> 📋 **Guía completa paso a paso: [DEPLOY.md](./DEPLOY.md)**

Resumen del proceso:
1. Subir código a GitHub
2. Crear servidor en CubePath y conectarlo
3. Desplegar cada servicio desde el panel de CubePath (PostgreSQL → MinIO → Ollama → n8n → NocoDB → Next.js)
4. Configurar registros DNS en Hostinger
5. Activar HTTPS automático (Let's Encrypt via CubePath)

---

## Variables de Entorno

Se configuran **directamente en el panel de CubePath** (no en archivos locales).  
Ver referencia completa en `frontend/.env.local.example`.

| Variable | Valor en CubePath |
|----------|-------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://TU_ID.supabase.co` (Supabase Cloud) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tu anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Tu service role key (solo server-side) |
| `OLLAMA_BASE_URL` | `http://fpf-ollama:11434` |
| `OLLAMA_MODEL` | `llava:13b` (o `llava:7b` si hay poca RAM) |
| `MINIO_ENDPOINT` | `fpf-minio` |
| `MINIO_ACCESS_KEY` | Tu access key de MinIO |
| `MINIO_SECRET_KEY` | Tu secret key de MinIO |
| `N8N_WEBHOOK_URL` | `https://n8n.florapetfriend.site/webhook` |
| `NEXT_PUBLIC_APP_URL` | `https://florapetfriend.site` |

---

## Flujo de la Aplicación

```
1. Usuario sube foto o escribe nombre
2. /api/identify → Ollama LLaVA identifica la especie
3. Hasta 3 resultados en slider de tarjetas
4. Advertencia roja si el animal/planta es ilegal o no recomendado
5. Botón "ver más" si hay más de 3 resultados
6. Usuario selecciona especie → ficha completa
7. Botón "crear mini compañero virtual"
8. Ollama genera nombre + personalidad + mensaje de la mascota
9. Ollama genera plan de cuidados (recordatorios)
10. n8n ejecuta recordatorios automáticos cada hora
```

---

## Despliegue en Producción

Ver guías detalladas:

- [Despliegue en CubePath](docs/deployment-cubepath.md)
- [Configuración DNS en Hostinger](docs/hostinger-dns.md)
- [Arquitectura del Sistema](docs/architecture.md)

---

## Servicios y Puertos

| Servicio | Puerto | URL de Acceso |
|---------|--------|---------------|
| Next.js | 3000 | https://florapetfriend.site |
| Supabase | 8000 | Interno |
| Ollama | 11434 | Interno |
| MinIO | 9000/9001 | https://storage.florapetfriend.site |
| n8n | 5678 | https://n8n.florapetfriend.site |
| NocoDB | 8080 | https://admin.florapetfriend.site |

---

## Seguridad

- Todas las contraseñas deben cambiarse antes de producción
- Ollama y Supabase no deben exponerse públicamente (solo acceso interno)
- Usar HTTPS en todos los subdominios (Let's Encrypt vía CubePath)
- Ver [docs/security.md](docs/security.md) para checklist completo

---

## Licencia

MIT © FloraPetFriend 2026
