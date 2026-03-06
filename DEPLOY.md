# Deploy SHM System ke VPS

## Prerequisites

- VPS dengan IP: **110.232.92.134**
- OS: Ubuntu 20.04+ (atau Linux lainnya)
- Akses SSH ke VPS

---

## Step 1: Install Docker & Docker Compose di VPS

SSH ke VPS:
```bash
ssh root@110.232.92.134
```

Install Docker:
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose plugin
apt install -y docker-compose-plugin

# Verify
docker --version
docker compose version
```

---

## Step 2: Upload Project ke VPS

Dari komputer lokal (Windows), jalankan:
```powershell
# Compress project (tanpa node_modules, venv, .next, .git)
# Upload via SCP
scp -r "C:\Users\nasch\Downloads\Structural Health Monitoring System" root@110.232.92.134:/opt/shm-system
```

Atau gunakan Git:
```bash
# Di VPS
cd /opt
git clone <repository-url> shm-system
```

---

## Step 3: Build & Run

```bash
cd /opt/shm-system

# Build dan jalankan semua container
docker compose up -d --build

# Cek status
docker compose ps

# Lihat logs
docker compose logs -f
```

---

## Step 4: Verifikasi

Buka di browser:
- **Dashboard**: http://110.232.92.134:3001
- **API**: http://110.232.92.134:3001/api/sensor-data/latest/
- **Admin**: http://110.232.92.134:3001/admin/

---

## Perintah Berguna

```bash
# Restart semua service
docker compose restart

# Stop semua service
docker compose down

# Rebuild setelah update code
docker compose up -d --build

# Lihat logs backend
docker compose logs -f backend

# Lihat logs semua
docker compose logs -f

# Masuk ke container backend
docker compose exec backend bash

# Create Django superuser
docker compose exec backend python manage.py createsuperuser

# Backup database PostgreSQL
docker compose exec db pg_dump -U shm_user shm_database > backup.sql
```

---

## Konfigurasi Database

| Setting  | Value          |
|----------|----------------|
| Engine   | PostgreSQL 15  |
| Database | shm_database   |
| User     | shm_user       |
| Password | smpn216jakarta |
| Host     | db (internal)  |
| Port     | 5432           |

---

## Arsitektur

```
Port 3001 → Nginx
           ├── /api/*    → Django Backend (Gunicorn :8000)
           ├── /admin/*  → Django Backend (Gunicorn :8000)
           └── /*        → Next.js Frontend (:3000)

Backend container juga menjalankan:
  └── MQTT Listener (background process)

MQTT Publisher → broker.emqx.io → MQTT Listener → PostgreSQL → API → Frontend
```
