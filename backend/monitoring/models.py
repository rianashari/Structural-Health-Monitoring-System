from django.db import models


class SensorData(models.Model):
    """
    Model untuk menyimpan data sensor dari Structural Health Monitoring.
    Data diterima melalui MQTT dari topic tower/bts/nyk/verticality/data/site/dmt/telemetry.
    Setiap record memiliki device_id untuk membedakan site.
    """
    device_id = models.CharField(
        max_length=50,
        default='DPK',
        db_index=True,
        help_text='ID perangkat/site (contoh: CKG-04-031-MM)'
    )
    timestamp = models.DateTimeField(
        auto_now_add=True,
        db_index=True,
        help_text='Waktu data diterima'
    )
    wind_speed = models.FloatField(
        default=0.0,
        help_text='Kecepatan angin dalam knot'
    )
    wind_speed_ms = models.FloatField(
        default=0.0,
        help_text='Kecepatan angin dalam m/s'
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
    indikator = models.CharField(
        max_length=20,
        default='tolerance',
        choices=[('tolerance', 'Tolerance'), ('intolerance', 'Intolerance')],
        help_text='Indikator status: tolerance atau intolerance'
    )

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Sensor Data'
        verbose_name_plural = 'Sensor Data'
        indexes = [
            models.Index(fields=['device_id', '-timestamp']),
        ]

    def __str__(self):
        return f"SensorData [{self.device_id}] [{self.timestamp:%Y-%m-%d %H:%M:%S}] - Wind: {self.wind_speed}, Tilt: {self.total_tilt}°"
