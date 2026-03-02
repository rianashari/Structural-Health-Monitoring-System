"""
MQTT Listener (Subscriber) untuk Structural Health Monitoring.
Script ini mendengarkan data dari broker MQTT dan menyimpannya ke database Django.

Broker : broker.emqx.io (MQTTX Public)
Topic  : verticality/nyk/data

Cara menjalankan:
    python mqtt_listener.py
"""

import os
import sys
import json
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'shm_backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

import paho.mqtt.client as mqtt
from datetime import datetime
from monitoring.models import SensorData
from django.conf import settings


def on_connect(client, userdata, flags, reason_code, properties=None):
    """Callback saat berhasil terhubung ke broker MQTT."""
    if reason_code == 0:
        print("=" * 60)
        print("  MQTT LISTENER - Structural Health Monitoring")
        print("=" * 60)
        print(f"  ✓ Connected to broker: {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}")
        print(f"  ✓ Subscribing to topic: {settings.MQTT_TOPIC}")
        print("=" * 60)
        print()
        client.subscribe(settings.MQTT_TOPIC)
    else:
        print(f"  ✗ Connection failed with code: {reason_code}")


def on_message(client, userdata, msg):
    """Callback saat menerima pesan dari broker MQTT."""
    try:
        payload = json.loads(msg.payload.decode('utf-8'))
        now = datetime.now()

        print(f"[{now:%H:%M:%S}] 📥 Data diterima dari topic: {msg.topic}")
        print(f"         Wind Speed  : {payload.get('wind_speed', 0):.2f} knot")
        print(f"         Pitch       : {payload.get('pitch', 0):.3f}°")
        print(f"         Roll        : {payload.get('roll', 0):.3f}°")
        print(f"         Tilt Rate   : {payload.get('tilt_rate', 0):.3f}°")
        print(f"         Sway        : {payload.get('sway', 0):.1f} mm")
        print(f"         Total Tilt  : {payload.get('total_tilt', 0):.4f}°")

        # Simpan ke database
        sensor_data = SensorData.objects.create(
            wind_speed=payload.get('wind_speed', 0),
            pitch=payload.get('pitch', 0),
            roll=payload.get('roll', 0),
            tilt_rate=payload.get('tilt_rate', 0),
            sway=payload.get('sway', 0),
            total_tilt=payload.get('total_tilt', 0),
        )

        print(f"         ✓ Tersimpan di database (ID: {sensor_data.id})")
        print()

    except json.JSONDecodeError:
        print(f"[ERROR] Gagal parse JSON: {msg.payload.decode('utf-8')}")
    except Exception as e:
        print(f"[ERROR] Gagal menyimpan data: {e}")


def on_disconnect(client, userdata, flags, reason_code, properties=None):
    """Callback saat terputus dari broker."""
    print(f"\n[INFO] Disconnected dari broker (code: {reason_code})")
    if reason_code != 0:
        print("[INFO] Mencoba reconnect...")


def main():
    """Fungsi utama untuk menjalankan MQTT Listener."""
    client_id = f"{settings.MQTT_CLIENT_ID_PREFIX}listener"
    client = mqtt.Client(
        client_id=client_id,
        callback_api_version=mqtt.CallbackAPIVersion.VERSION2
    )

    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect

    print(f"[INFO] Connecting to {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}...")
    print(f"[INFO] Client ID: {client_id}")
    print()

    try:
        client.connect(settings.MQTT_BROKER_HOST, settings.MQTT_BROKER_PORT, 60)
        client.loop_forever()
    except KeyboardInterrupt:
        print("\n[INFO] Listener dihentikan oleh user.")
        client.disconnect()
    except Exception as e:
        print(f"[ERROR] Gagal terhubung ke broker: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
