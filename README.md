# Structural Health Monitoring (SHM) System - Dashboard Verticality

Sistem Pemantauan Kesehatan Struktur (Structural Health Monitoring) yang dirancang khusus untuk memonitor tingkat kelurusan/kemiringan (*verticality*) dari menara telekomunikasi (BTS). Sistem ini mengintegrasikan data IoT secara *real-time* menggunakan protokol MQTT, menyimpannya ke database relasional, dan menyajikannya dalam bentuk dashboard analitik interaktif.

---

## 🏗️ Arsitektur Sistem & Aliran Data

Sistem ini terdiri dari tiga komponen utama yang dijalankan di dalam container Docker:
1. **Frontend (Next.js)**: Aplikasi web modern untuk menampilkan dashboard, visualisasi peta (*interactive map*), grafik tren data, dan manajemen visibilitas site.
2. **Backend (Django & DRF)**: Menyediakan API endpoints untuk frontend dan menjalankan *background process* berupa **MQTT Listener** yang berlangganan (*subscribe*) ke Broker MQTT untuk menerima telemetri sensor.
3. **Reverse Proxy (Nginx)**: Mengarahkan traffic di port `3001` menuju Next.js (port `3000`) dan Django API (port `8000`).

```
                               ┌────────────────────────┐
                               │     Sensor IoT BTS     │
                               └───────────┬────────────┘
                                           │ (MQTT Publish)
                                           ▼
                               ┌────────────────────────┐
                               │ MQTT Broker (EMQX/IP)  │
                               └───────────┬────────────┘
                                           │ (MQTT Subscribe)
                                           ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Docker Environment (VPS / Local)                                       │
│                                                                        │
│  ┌─────────────────┐       ┌─────────────────┐                         │
│  │  MQTT Listener  ├──────►│   PostgreSQL    │                         │
│  │  (Background)   │       │   (Database)    │                         │
│  └─────────────────┘       └────────┬────────┘                         │
│                                     │ (ORM)                            │
│                                     ▼                                  │
│  ┌─────────────────┐       ┌─────────────────┐       ┌──────────────┐  │
│  │   Next.js App   │◄──────┤ Django API (DRF)│◄──────┤  Web Browser │  │
│  │  (Port 3000)    │       │   (Port 8000)   │       │ (User Client)│  │
│  └────────┬────────┘       └────────┬────────┘       └──────┬───────┘  │
│           │                         │                       │          │
│           ▼                         ▼                       ▼          │
│      ┌────────────────────────────────────────────────────────┐        │
│      │                  Nginx Reverse Proxy                   │        │
│      │                      (Port 3001)                       │        │
│      └────────────────────────────────────────────────────────┘        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Fitur Utama

- **Real-Time Telemetry Tracking**: Memantau pergerakan menara melalui indikator:
  - *Wind Speed* (kecepatan angin) dalam knot dan m/s.
  - *Sway* (pergeseran horizontal) dalam milimeter (mm).
  - *Pitch* & *Roll* (sudut kemiringan sumbu X & Y) dalam derajat (°).
  - *Tilt Rate* & *Total Tilt* (kecepatan miring & total akumulasi kemiringan) dalam derajat (°).
- **Interactive Site Map**: Menggunakan React Leaflet untuk memetakan lokasi fisik menara secara spasial, lengkap dengan penanda warna sesuai status toleransi/kesehatan struktur (*Tolerance* vs *Intolerance*).
- **Interactive Analytics Charts**: Grafik data historis menggunakan Recharts untuk melacak tren fluktuasi kemiringan menara dari waktu ke waktu.
- **Site Visibility Management**: Memungkinkan administrator menyembunyikan atau menampilkan site tertentu di dashboard secara dinamis.
- **Export PDF Report**: Fitur unduh laporan data pemantauan site langsung ke format PDF menggunakan jsPDF.
- **MQTT Broker Integration**: Mampu memproses format data flat lama maupun format nested terstruktur yang baru.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Bahasa**: TypeScript
- **Peta/Geospatial**: Leaflet & React Leaflet
- **Visualisasi Grafik**: Recharts
- **Ekspor Dokumen**: jsPDF & jsPDF-Autotable
- **Icon Pack**: Lucide React
- **Styling**: Modern Custom Vanilla CSS

### Backend
- **Framework**: Django 4.2 & Django REST Framework (DRF)
- **Database**: PostgreSQL 15 (Produksi) / SQLite 3 (Pengembangan Lokal)
- **Protokol IoT**: MQTT via Paho-MQTT Client
- **WSGI Server**: Gunicorn

---

## 📂 Struktur Direktori

```
├── backend/                  # Kode Django & script MQTT
│   ├── monitoring/           # Django Application (models, views, serializers)
│   ├── shm_backend/          # Django Project Configurations & Settings
│   ├── mqtt_listener.py      # Background worker penangkap data MQTT
│   ├── mqtt_publisher.py     # Script simulator/generator dummy data untuk uji coba
│   ├── requirements.txt      # Dependensi Python
│   └── Dockerfile            # Dockerfile untuk backend service
│
├── frontend/                 # Kode Next.js Frontend
│   ├── app/                  # Next.js App Router (dashboard, login, site-map)
│   ├── components/           # Reusable UI Components
│   ├── data/                 # Static data & sites registry
│   ├── hooks/                # Custom React Hooks
│   ├── public/               # Asset publik (gambar, favicon)
│   └── Dockerfile            # Dockerfile untuk frontend service
│
├── nginx/                    # Konfigurasi reverse proxy
│   └── nginx.conf            # Nginx routing rules (Port 3001)
│
├── docker-compose.yml        # Konfigurasi orkestrasi container Docker
└── DEPLOY.md                 # Panduan instalasi dan deployment di VPS
```

---

## 🚀 Cara Menjalankan Project

### A. Menggunakan Docker Compose (Direkomendasikan)

Pastikan Docker dan Docker Compose telah terinstal di komputer/VPS Anda.

1. Clone repositori ini ke mesin Anda.
2. Jalankan perintah berikut di direktori utama project:
   ```bash
   docker compose up -d --build
   ```
3. Tunggu hingga semua kontainer selesai dibangun dan berjalan. Anda dapat memverifikasi status kontainer dengan:
   ```bash
   docker compose ps
   ```
4. Akses sistem melalui browser di alamat:
   - **Dashboard & Frontend**: `http://localhost:3001`
   - **Admin Panel**: `http://localhost:3001/admin/`
   - **API Endpoint**: `http://localhost:3001/api/sensor-data/`

---

### B. Pengembangan Lokal (Tanpa Docker)

#### 1. Persiapan Backend:
1. Masuk ke direktori `backend`:
   ```bash
   cd backend
   ```
2. Buat dan aktifkan *virtual environment*:
   ```bash
   python -m venv venv
   # Di Windows:
   venv\Scripts\activate
   # Di macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependensi:
   ```bash
   pip install -r requirements.txt
   ```
4. Jalankan migrasi database (secara default akan menggunakan SQLite untuk lokal):
   ```bash
   python manage.py migrate
   ```
5. Buat user administrator untuk admin panel:
   ```bash
   python manage.py createsuperuser
   ```
6. Jalankan Django Development Server:
   ```bash
   python manage.py runserver
   ```
7. Jalankan background worker MQTT Listener di terminal baru (pastikan *virtual environment* aktif):
   ```bash
   python mqtt_listener.py
   ```
8. *(Opsional)* Jika Anda ingin menyimulasikan data sensor masuk, jalankan script publisher:
   ```bash
   python mqtt_publisher.py
   ```

#### 2. Persiapan Frontend:
1. Buka terminal baru dan masuk ke direktori `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependensi Node.js:
   ```bash
   npm install
   ```
3. Jalankan server Next.js lokal:
   ```bash
   npm run dev
   ```
4. Aplikasi frontend lokal dapat diakses melalui `http://localhost:3000`.

---

## 📡 Daftar API Endpoints

Semua endpoint API backend dikelompokkan di bawah prefix `/api/`:

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/api/sensor-data/` | Mengambil seluruh data sensor (terpaginasi) |
| `GET` | `/api/sensor-data/latest/` | Mengambil data sensor terbaru dari masing-masing site |
| `GET` | `/api/sensor-data/history/` | Mengambil data riwayat sensor berdasarkan `device_id` tertentu |
| `GET` | `/api/sensor-data/sites-status/` | Mendapatkan status terkini (Online/Offline) dan metrik penting dari semua site |
| `GET`/`POST`| `/api/sensor-data/sites-visibility/` | Mengambil atau mengubah status visibilitas site di dashboard |
| `GET`/`POST`| `/api/sensor-data/sites/` | Mengambil semua konfigurasi site statis atau mendaftarkan site baru |
| `GET`/`PUT`/`DELETE`| `/api/sensor-data/sites/<id>/` | Mengambil detail, memperbarui, atau menghapus data site terdaftar |

---

## 📝 Panduan Tambahan

Untuk panduan deployment ke VPS (Virtual Private Server), konfigurasi database PostgreSQL produksi, serta kumpulan command operasional penting, silakan merujuk pada file [DEPLOY.md](file:///c:/Users/nasch/Downloads/Dashboard_Verticality/DEPLOY.md).
