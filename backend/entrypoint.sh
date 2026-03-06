#!/bin/bash

echo "============================================"
echo "  SHM Backend - Starting..."
echo "============================================"

# Wait for PostgreSQL to be ready
echo "[INFO] Waiting for PostgreSQL..."
while ! python -c "
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
try:
    s.connect(('${DB_HOST:-db}', ${DB_PORT:-5432}))
    s.close()
    exit(0)
except:
    exit(1)
" 2>/dev/null; do
    echo "[INFO] PostgreSQL is not ready yet. Waiting..."
    sleep 2
done
echo "[INFO] PostgreSQL is ready!"

# Run migrations
echo "[INFO] Running database migrations..."
python manage.py migrate --noinput

# Collect static files
echo "[INFO] Collecting static files..."
python manage.py collectstatic --noinput

# Start MQTT Listener in background
echo "[INFO] Starting MQTT Listener in background..."
python mqtt_listener.py &

# Start Gunicorn
echo "[INFO] Starting Gunicorn server..."
exec gunicorn shm_backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
