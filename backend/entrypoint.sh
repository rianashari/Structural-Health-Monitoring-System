#!/bin/bash

echo "============================================"
echo "  SHM Backend - Starting..."
echo "============================================"

# Wait for PostgreSQL to be ready
echo "[INFO] Waiting for PostgreSQL at ${DB_HOST:-db}:${DB_PORT:-5432}..."
MAX_RETRIES=30
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if python -c "
import socket, sys
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(3)
try:
    s.connect(('${DB_HOST:-db}', int('${DB_PORT:-5432}')))
    s.close()
    sys.exit(0)
except Exception:
    sys.exit(1)
" 2>/dev/null; then
        echo "[INFO] PostgreSQL is ready!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    echo "[INFO] PostgreSQL is not ready yet (attempt $RETRY_COUNT/$MAX_RETRIES). Waiting 3s..."
    sleep 3
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    echo "[ERROR] PostgreSQL did not become ready after $MAX_RETRIES attempts. Starting anyway..."
fi

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
echo "[INFO] Starting Gunicorn server on 0.0.0.0:8000..."
exec gunicorn shm_backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
