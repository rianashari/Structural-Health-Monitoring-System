from rest_framework import serializers
from .models import SensorData


class SensorDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorData
        fields = [
            'id',
            'device_id',
            'timestamp',
            'wind_speed',
            'wind_speed_ms',
            'pitch',
            'roll',
            'tilt_rate',
            'sway',
            'total_tilt',
            'indikator',
        ]
        read_only_fields = ['id', 'timestamp']
