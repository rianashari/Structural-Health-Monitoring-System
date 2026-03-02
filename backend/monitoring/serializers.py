from rest_framework import serializers
from .models import SensorData


class SensorDataSerializer(serializers.ModelSerializer):
    """Serializer untuk model SensorData."""

    class Meta:
        model = SensorData
        fields = [
            'id',
            'timestamp',
            'wind_speed',
            'pitch',
            'roll',
            'tilt_rate',
            'sway',
            'total_tilt',
        ]
        read_only_fields = ['id', 'timestamp']
