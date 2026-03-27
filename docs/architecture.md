# FloraPetFriend — Architecture

## System Diagram

```
                    ┌─────────────────────────────────────────────┐
                    │           florapetfriend.site                │
                    │         (Hostinger DNS → CubePath)           │
                    └──────────────────┬──────────────────────────┘
                                       │  HTTPS
                    ┌──────────────────▼──────────────────────────┐
                    │         Coolify / Dokploy (CubePath)         │
                    │         Reverse Proxy (Traefik/Caddy)        │
                    └──┬──────────┬──────────┬───────────┬────────┘
                       │          │          │           │
              ┌────────▼──┐  ┌────▼────┐ ┌──▼──────┐ ┌─▼────────┐
              │  Next.js  │  │Supabase │ │  n8n    │ │ NocoDB   │
              │  :3000    │  │  :8000  │ │  :5678  │ │  :8080   │
              │(Frontend) │  │(DB+Auth)│ │(Automtn)│ │(Admin)   │
              └────┬──────┘  └────┬────┘ └────┬────┘ └──────────┘
                   │              │           │
              ┌────▼──────┐  ┌────▼────┐ ┌───▼──────┐
              │  Ollama   │  │  MinIO  │ │PostgreSQL│
              │  :11434   │  │  :9000  │ │(Supabase)│
              │(LLaVA+    │  │(Storage)│ └──────────┘
              │ Llama3.2) │  └─────────┘
              └───────────┘
```

## Data Flow

### Species Identification (Image)
```
User uploads image
    → Next.js API /api/identify (POST multipart)
        → lib/ollama.ts: identifyFromImage(base64)
            → Ollama LLaVA model (llava:13b)
                → Returns JSON array (up to 3 species)
        → Save to Supabase species table
    → Redirect to /identify/results?ids=...
        → Fetch each species from /api/species/[id]
        → Render SpeciesCard × 3
```

### Virtual Pet Creation
```
User clicks "Crear mascota virtual"
    → Next.js API /api/virtual-pet (POST)
        → lib/ollama.ts: generateVirtualPetName()
            → Ollama llama3.2 → name, personality, message
        → lib/ollama.ts: generateCareReminders()
            → Ollama llama3.2 → care schedule JSON
        → Insert virtual_pets row → Supabase
        → Insert reminders rows  → Supabase
    → Redirect to /pets
```

### Automated Reminders (n8n)
```
n8n Schedule Trigger (every hour)
    → PostgreSQL query: reminders WHERE time = current_hour
    → Split into individual items
    → HTTP POST to /webhook/notify
        → (future: push notification / email / Telegram)
```

## Tech Stack Summary

| Layer        | Technology       | Port  | Purpose                        |
|-------------|-----------------|-------|-------------------------------|
| Frontend    | Next.js 14       | 3000  | App Router, RSC, API routes   |
| Styling     | TailwindCSS      | —     | Utility-first CSS             |
| Database    | Supabase/Postgres| 8000  | Data + Auth + RLS             |
| AI Vision   | Ollama (LLaVA)   | 11434 | Image-based identification    |
| AI Text     | Ollama (Llama3.2)| 11434 | Text queries + pet generation |
| Storage     | MinIO            | 9000  | Pet photos + avatar storage   |
| Automation  | n8n              | 5678  | Reminder workflows            |
| Admin       | NocoDB           | 8080  | Database admin UI             |
| Deploy      | Coolify/Dokploy  | —     | Container orchestration       |
| DNS         | Hostinger        | —     | florapetfriend.site           |
