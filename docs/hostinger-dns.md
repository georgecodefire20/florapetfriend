# FloraPetFriend — DNS Configuration (Hostinger)

## Overview

You need to point `florapetfriend.site` and its subdomains to your CubePath server's IP address.

**Your CubePath server IP**: Get this from CubePath → Servers → your server → "IP Address"

---

## Step 1 — Log in to Hostinger

1. Go to https://hpanel.hostinger.com
2. Log in with your credentials
3. Go to **Domains → florapetfriend.site → DNS / Nameservers**

---

## Step 2 — Create DNS Records

Add the following records in Hostinger's DNS Manager:

### Main domain (Next.js frontend)

| Type | Name  | Value               | TTL  |
|------|-------|---------------------|------|
| A    | @     | YOUR_SERVER_IP      | 3600 |
| A    | www   | YOUR_SERVER_IP      | 3600 |

### App subdomain (alias for main)

| Type  | Name | Value                  | TTL  |
|-------|------|------------------------|------|
| CNAME | app  | florapetfriend.site    | 3600 |

### API subdomain (optional, for dedicated API)

| Type | Name | Value          | TTL  |
|------|------|----------------|------|
| A    | api  | YOUR_SERVER_IP | 3600 |

### Storage (MinIO console)

| Type | Name    | Value          | TTL  |
|------|---------|----------------|------|
| A    | storage | YOUR_SERVER_IP | 3600 |

### n8n (Automation)

| Type | Name | Value          | TTL  |
|------|------|----------------|------|
| A    | n8n  | YOUR_SERVER_IP | 3600 |

### Admin Panel (NocoDB)

| Type | Name  | Value          | TTL  |
|------|-------|----------------|------|
| A    | admin | YOUR_SERVER_IP | 3600 |

---

## Step 3 — Verify DNS propagation

DNS changes can take 10–60 minutes. Check propagation with:

```bash
# Check main domain
nslookup florapetfriend.site

# Check subdomains
nslookup app.florapetfriend.site
nslookup n8n.florapetfriend.site
nslookup admin.florapetfriend.site
nslookup storage.florapetfriend.site
```

Or use https://dnschecker.org to check global propagation.

---

## Step 4 — Configure domains in CubePath

For each service in CubePath, add the corresponding domain:

| CubePath Service | Domain                             |
|-----------------|-------------------------------------|
| fpf-frontend    | florapetfriend.site                 |
| fpf-frontend    | www.florapetfriend.site             |
| fpf-frontend    | app.florapetfriend.site             |
| fpf-minio       | storage.florapetfriend.site         |
| fpf-n8n         | n8n.florapetfriend.site             |
| fpf-nocodb      | admin.florapetfriend.site           |

---

## Step 5 — Enable HTTPS (Let's Encrypt)

CubePath automatically provisions SSL certificates.

1. In CubePath, go to each service → **Domains**
2. Click **Generate SSL** next to each domain
3. Enable **Force HTTPS redirect**

The certificate renews automatically every 90 days.

---

## Step 6 — Test HTTPS

```bash
curl -I https://florapetfriend.site
# Expected: HTTP/2 200

curl -I https://n8n.florapetfriend.site
# Expected: HTTP/2 200 or 401 (auth required)

curl -I https://admin.florapetfriend.site
# Expected: HTTP/2 200
```

---

## Troubleshooting

**ERR_TOO_MANY_REDIRECTS**: Disable HTTP→HTTPS redirect in Hostinger if CubePath handles it.

**Certificate error**: Make sure DNS is fully propagated before requesting the certificate.

**404 on subdomain**: Verify the A record in Hostinger points to the correct server IP and the service in CubePath has the domain configured.
