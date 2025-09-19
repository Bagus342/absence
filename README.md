# Description

Server side dari aplikasi absen. Menggunakan bahasa TypeScript, Framework NestJS dan http Fastify.

# Project setup

## Setup env file

```
POSTGRES_USER=user
POSTGRES_PASSWORD=pass
POSTGRES_DB=example

# PORT=3000
# HOSTNAME=0.0.0.0
DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"

ABLY_KEY=WSLnzw.n175ag:_y13AEmSs7qTuegiDiAbYLo7dftMgsGzUIvLO1XXu5M
SECRET_KEY=Ds2lgo1DWmpjJWMCOPBwjtawN7Xssopm+Yr8XT84LSiGmZbMVJeO/Fq2JHJ4hMmF
WAHA_BASE_URL=http://localhost:3000
SERVER_SECRET=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
SALT='3znlf:D)-tjX'

# Server configuration (if you need to customize hostname/port)
# WHATSAPP_API_SCHEMA=http
WHATSAPP_API_PORT=3000
WHATSAPP_API_HOSTNAME=0.0.0.0

WHATSAPP_HOOK_URL=http://host.docker.internal:8000/api/whatsapp/webhook
WHATSAPP_HOOK_EVENTS=session.status

# ====================
# ===== SECURITY =====
# ====================
# "sha512:{SHA}" format - below is "admin" api key
WAHA_API_KEY=sha512:c7ad44cbad762a5da0a452f9e854fdc1e0e7a52a38015f23f3eab1d80b931dd472634dfac71cd34ebc35d16ab7fb8a90c81f975113d6c7538dc69dd8de9077ec
WAHA_DASHBOARD_ENABLED=True
WAHA_DASHBOARD_USERNAME=admin
WAHA_DASHBOARD_PASSWORD=admin
WHATSAPP_SWAGGER_ENABLED=True
WHATSAPP_SWAGGER_USERNAME=admin
WHATSAPP_SWAGGER_PASSWORD=admin

# WhatsApp engine (WEBJS is default, GOWS or NOWEB for better performance)
WHATSAPP_DEFAULT_ENGINE=WEBJS

# ===================
# ===== LOGGING =====
# ===================
# Log format: JSON (for log management systems) or PRETTY (for development)
WAHA_LOG_FORMAT=JSON

# Log level: info, debug, error, warn
WAHA_LOG_LEVEL=info

# Don't print QR codes in logs
WAHA_PRINT_QR=False

WAHA_MEDIA_STORAGE=LOCAL
WHATSAPP_FILES_LIFETIME=0
WHATSAPP_FILES_FOLDER=/app/.media

WHATSAPP_SESSIONS_POSTGRESQL_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}?sslmode=disable"
```

## Build Docker Compose

```bash
$ docker compose build
```

## Up Docker Compose

```bash
$ docker compose up
```

OR

```bash
$ docker compose up -d
```

## Server started

Server running on http://localhost:3000
