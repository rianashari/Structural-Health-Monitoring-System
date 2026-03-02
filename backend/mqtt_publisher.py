"""
MQTT Publisher - Dummy Data untuk Structural Health Monitoring.
Script ini mempublish data dummy sensor ke broker MQTT setiap 5 detik.

Broker : broker.emqx.io (MQTTX Public)
Topic  : verticality/nyk/data

Cara menjalankan:
    python mqtt_publisher.py
"""

import json
import time
import random
import paho.mqtt.client as mqtt
from datetime import datetime

# ============================================================
# Konfigurasi MQTT
# ============================================================
BROKER_HOST = 'broker.emqx.io'
BROKER_PORT = 1883
TOPIC = 'verticality/nyk/data'
CLIENT_ID = 'shm_backend_publisher'
PUBLISH_INTERVAL = 5  # detik


def generate_dummy_data():
    """
    Generate data dummy sensor SHM yang realistis.
    Range nilai disesuaikan dengan yang ditampilkan di frontend dashboard.
    """
    return {
        'wind_speed': round(random.uniform(0.0, 5.0), 2),       # 0 - 5 knot (normal range)
        'pitch': round(random.uniform(-0.5, 0.5), 3),           # -0.5° to 0.5°
        'roll': round(random.uniform(-0.5, 0.5), 3),            # -0.5° to 0.5°
        'tilt_rate': round(random.uniform(0.0, 0.1), 4),        # 0 - 0.1°
        'sway': round(random.uniform(10.0, 70.0), 1),           # 10 - 70 mm
        'total_tilt': round(random.uniform(0.01, 0.1), 4),      # 0.01° - 0.1°
    }


def on_connect(client, userdata, flags, reason_code, properties=None):
    """Callback saat berhasil terhubung ke broker MQTT."""
    if reason_code == 0:
        print("=" * 60)
        print("  MQTT PUBLISHER - Dummy Data Generator")
        print("=" * 60)
        print(f"  ✓ Connected to broker: {BROKER_HOST}:{BROKER_PORT}")
        print(f"  ✓ Publishing to topic: {TOPIC}")
        print(f"  ✓ Interval: setiap {PUBLISH_INTERVAL} detik")
        print("=" * 60)
        print()
    else:
        print(f"  ✗ Connection failed with code: {reason_code}")


def on_disconnect(client, userdata, flags, reason_code, properties=None):
    """Callback saat terputus dari broker."""
    print(f"\n[INFO] Disconnected dari broker (code: {reason_code})")


def main():
    """Fungsi utama untuk menjalankan MQTT Publisher."""
    client = mqtt.Client(
        client_id=CLIENT_ID,
        callback_api_version=mqtt.CallbackAPIVersion.VERSION2
    )

    client.on_connect = on_connect
    client.on_disconnect = on_disconnect

    print(f"[INFO] Connecting to {BROKER_HOST}:{BROKER_PORT}...")
    print()

    try:
        client.connect(BROKER_HOST, BROKER_PORT, 60)
        client.loop_start()

        # Tunggu koneksi berhasil
        time.sleep(2)

        message_count = 0

        while True:
            data = generate_dummy_data()
            payload = json.dumps(data)
            result = client.publish(TOPIC, payload, qos=1)

            message_count += 1
            now = datetime.now()

            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                print(f"[{now:%H:%M:%S}] 📤 Message #{message_count} published")
                print(f"         Wind Speed  : {data['wind_speed']:.2f} knot")
                print(f"         Pitch       : {data['pitch']:.3f}°")
                print(f"         Roll        : {data['roll']:.3f}°")
                print(f"         Tilt Rate   : {data['tilt_rate']:.4f}°")
                print(f"         Sway        : {data['sway']:.1f} mm")
                print(f"         Total Tilt  : {data['total_tilt']:.4f}°")
                print()
            else:
                print(f"[{now:%H:%M:%S}] ✗ Gagal publish message #{message_count}")

            time.sleep(PUBLISH_INTERVAL)

    except KeyboardInterrupt:
        print(f"\n[INFO] Publisher dihentikan. Total pesan terkirim: {message_count}")
        client.loop_stop()
        client.disconnect()
    except Exception as e:
        print(f"[ERROR] {e}")
        client.loop_stop()
        client.disconnect()


if __name__ == '__main__':
    main()
