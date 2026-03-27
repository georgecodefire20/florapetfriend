# FloraPetFriend — Security Checklist

## Before deploying to production, verify every item:

---

## 1. Environment Variables

- [ ] All passwords changed from defaults (never use `minioadmin`, `change_me`, etc.)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is ONLY used server-side (Next.js API routes), never exposed to the browser
- [ ] `NEXT_PUBLIC_*` variables contain NO secrets (they are visible in the browser)
- [ ] `.env` files are in `.gitignore` and never committed to Git
- [ ] Minimum password length: 20 characters, mix of letters/numbers/symbols

```bash
# Generate strong secrets:
openssl rand -base64 32   # for passwords and JWT secrets
openssl rand -hex 16      # for encryption keys
```

---

## 2. Supabase / PostgreSQL

- [ ] Row Level Security (RLS) is enabled on all tables (done in migration)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` only used in server-side routes
- [ ] Database not exposed on public port (internal network only)
- [ ] Regular backups configured in CubePath (daily minimum)
- [ ] Disable direct PostgreSQL access from internet (firewall rule)

---

## 3. Ollama

- [ ] Ollama port `11434` is NOT exposed publicly (internal service only)
- [ ] No reverse proxy to Ollama from the internet
- [ ] Only `frontend` container can reach `ollama` container (Docker network)

```yaml
# In docker-compose.yml, Ollama has NO ports: section for public access
# Only accessible via internal Docker network: http://ollama:11434
```

---

## 4. MinIO

- [ ] `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` changed from defaults
- [ ] MinIO console (`9001`) protected by authentication
- [ ] S3 API port `9000` not exposed publicly (use pre-signed URLs)
- [ ] Buckets `pet-photos` and `virtual-pets` set to public READ only (not write)

---

## 5. n8n

- [ ] `N8N_BASIC_AUTH_ACTIVE=true` (basic auth enabled)
- [ ] Strong password set for n8n admin user
- [ ] `N8N_ENCRYPTION_KEY` is 32+ chars random
- [ ] Webhook endpoints use secret tokens for validation
- [ ] n8n not accessible without authentication

---

## 6. NocoDB (Admin Panel)

- [ ] First login creates admin account — do this IMMEDIATELY after deployment
- [ ] NocoDB URL is NOT indexed by search engines (add `X-Robots-Tag: noindex`)
- [ ] Consider IP allowlist for admin subdomain in CubePath

---

## 7. HTTPS / TLS

- [ ] All domains have valid HTTPS certificates (Let's Encrypt via CubePath)
- [ ] Force HTTPS redirect enabled for all services
- [ ] HTTP Strict Transport Security (HSTS) header configured

---

## 8. Next.js Application

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` has restricted permissions (RLS enforces access)
- [ ] File upload validates MIME type AND extension on the server (`/api/identify`)
- [ ] File size limit enforced (10MB max, set in `IdentifyForm.tsx`)
- [ ] No sensitive data logged to console in production
- [ ] API routes return generic error messages (no stack traces exposed)

---

## 9. Docker / Infrastructure

- [ ] All containers run as non-root users where possible
- [ ] Server firewall rules: only ports 80, 443 (and 22 for SSH) public
- [ ] All internal services communicate via Docker internal network
- [ ] Docker images pinned to specific versions (not `:latest` in production)
- [ ] CubePath auto-updates and security patches applied

---

## 10. Legal Compliance

- [ ] Privacy policy page created at `/privacy`
- [ ] Cookie consent banner (if using analytics)
- [ ] GDPR: users can delete their data (add DELETE endpoint)
- [ ] CITES warning displayed for regulated species (✅ done in `WarningBanner`)

---

## Recommended Firewall Rules (UFW / CubePath)

```bash
# On your CubePath server:
ufw allow 22/tcp      # SSH
ufw allow 80/tcp      # HTTP (redirects to HTTPS)
ufw allow 443/tcp     # HTTPS
ufw deny 3000/tcp     # Block direct Next.js access (use reverse proxy)
ufw deny 5432/tcp     # Block direct PostgreSQL access
ufw deny 11434/tcp    # Block direct Ollama access
ufw deny 9000/tcp     # Block direct MinIO S3 access
ufw deny 9001/tcp     # Block direct MinIO console (use subdomain via proxy)
ufw deny 5678/tcp     # Block direct n8n access (use subdomain via proxy)
ufw deny 8080/tcp     # Block direct NocoDB access (use subdomain via proxy)
ufw enable
```
