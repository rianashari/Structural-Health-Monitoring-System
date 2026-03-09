"""
MQTT Listener (Subscriber) untuk Structural Health Monitoring.
Script ini mendengarkan data dari broker MQTT dan menyimpannya ke database Django.

Broker : 202.155.90.125:1883
Topic  : tower/bts/nyk/verticality/data/site/dmt/telemetry

Semua site menggunakan topic yang sama, dibedakan oleh device_id pada payload.

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
        print("  Multi-Site Integration")
        print("=" * 60)
        print(f"  ✓ Connected to broker: {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}")
        print(f"  ✓ Subscribing to topic: {settings.MQTT_TOPIC}")
        print("=" * 60)
        print()
        client.subscribe(settings.MQTT_TOPIC)
    else:
        print(f"  ✗ Connection failed with code: {reason_code}")


def parse_payload(payload):
    """
    Parse payload dari format baru (nested) atau lama (flat).

    Format baru:
    {
      "device_id": "CKG-04-031-MM",
      "timestamp": "1773022105995",
      "status": "active",
      "sensors": {
        "wind_speed": 0,
        "axes": { "pitch": 0.21, "roll": 0.27, "tilt_rate": 0.34, "total_tilt": 0.34 },
        "sway": 0
      }
    }

    Format lama (backward compat):
    { "wind_speed": 0, "pitch": 0.21, "roll": 0.27, ... }
    """
    if 'sensors' in payload:
        # Format baru — nested
        sensors = payload.get('sensors', {})
        axes = sensors.get('axes', {})
        return {
            'device_id': payload.get('device_id', 'UNKNOWN'),
            'wind_speed': sensors.get('wind_speed', 0),
            'pitch': axes.get('pitch', 0),
            'roll': axes.get('roll', 0),
            'tilt_rate': axes.get('tilt_rate', 0),
            'total_tilt': axes.get('total_tilt', 0),
            'sway': sensors.get('sway', 0),
        }
    else:
        # Format lama — flat (backward compatibility)
        return {
            'device_id': payload.get('device_id', 'DPK'),
            'wind_speed': payload.get('wind_speed', 0),
            'pitch': payload.get('pitch', 0),
            'roll': payload.get('roll', 0),
            'tilt_rate': payload.get('tilt_rate', 0),
            'total_tilt': payload.get('total_tilt', 0),
            'sway': payload.get('sway', 0),
        }


def on_message(client, userdata, msg):
    """Callback saat menerima pesan dari broker MQTT."""
    try:
        raw_payload = json.loads(msg.payload.decode('utf-8'))
        now = datetime.now()

        data = parse_payload(raw_payload)
        device_id = data['device_id']

        print(f"[{now:%H:%M:%S}] 📥 Data diterima - Device: {device_id}")
        print(f"         Wind Speed  : {data['wind_speed']:.2f}")
        print(f"         Pitch       : {data['pitch']:.3f}°")
        print(f"         Roll        : {data['roll']:.3f}°")
        print(f"         Tilt Rate   : {data['tilt_rate']:.3f}°")
        print(f"         Sway        : {data['sway']:.1f} mm")
        print(f"         Total Tilt  : {data['total_tilt']:.4f}°")

        # Simpan ke database
        sensor_data = SensorData.objects.create(
            device_id=device_id,
            wind_speed=data['wind_speed'],
            pitch=data['pitch'],
            roll=data['roll'],
            tilt_rate=data['tilt_rate'],
            sway=data['sway'],
            total_tilt=data['total_tilt'],
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

    # Set authentication
    if hasattr(settings, 'MQTT_USERNAME') and settings.MQTT_USERNAME:
        client.username_pw_set(settings.MQTT_USERNAME, settings.MQTT_PASSWORD)

    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect

    print(f"[INFO] Connecting to {settings.MQTT_BROKER_HOST}:{settings.MQTT_BROKER_PORT}...")
    print(f"[INFO] Client ID: {client_id}")
    print(f"[INFO] Auth: {'Yes' if hasattr(settings, 'MQTT_USERNAME') else 'No'}")
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
