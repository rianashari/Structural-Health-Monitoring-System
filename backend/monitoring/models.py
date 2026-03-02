from django.db import models


class SensorData(models.Model):
    """
    Model untuk menyimpan data sensor dari Structural Health Monitoring.
    Data diterima melalui MQTT dari topic verticality/nyk/data.
    """
    timestamp = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text='Waktu data diterima'
    )
    wind_speed = models.FloatField(
        default=0.0,
        help_text='Kecepatan angin dalam knot'
    )
    pitch = models.FloatField(
        default=0.0,
        help_text='Sudut pitch dalam derajat'
    )
    roll = models.FloatField(
        default=0.0,
        help_text='Sudut roll dalam derajat'
    )
    tilt_rate = models.FloatField(
        default=0.0,
        help_text='Laju kemiringan dalam derajat'
    )
    sway = models.FloatField(
        default=0.0,
        help_text='Perpindahan sway dalam mm'
    )
    total_tilt = models.FloatField(
        default=0.0,
        help_text='Total kemiringan dalam derajat'
    )

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Sensor Data'
        verbose_name_plural = 'Sensor Data'

    def __str__(self):
        return f"SensorData [{self.timestamp:%Y-%m-%d %H:%M:%S}] - Wind: {self.wind_speed} knot, Tilt: {self.total_tilt}°"
