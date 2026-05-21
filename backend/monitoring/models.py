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


class SiteVisibility(models.Model):
    """
    Model ini menyimpan konfigurasi visibilitas site di dashboard.
    Data ini akan disinkronisasikan ke semua klien (browser).
    Jika is_hidden = True, site tidak akan ditampilkan di Site Map dan Sidebar.
    """
    device_id = models.CharField(
        max_length=50,
        unique=True,
        db_index=True,
        help_text='ID perangkat/site (contoh: KDS-06-039-MS)'
    )
    is_hidden = models.BooleanField(
        default=False,
        help_text='Apakah site ini disembunyikan dari dashboard?'
    )

    class Meta:
        verbose_name = 'Site Visibility'
        verbose_name_plural = 'Site Visibilities'

    def __str__(self):
        status = "Hidden" if self.is_hidden else "Visible"
        return f"Visibility [{self.device_id}] - {status}"


class Site(models.Model):
    """
    Model untuk menyimpan konfigurasi dan metadata site secara dinamis.
    """
    id = models.CharField(
        max_length=50,
        primary_key=True,
        help_text='ID unik site (contoh: ckg-04-031)'
    )
    name = models.CharField(
        max_length=100,
        help_text='Nama site'
    )
    siteId = models.CharField(
        max_length=50,
        help_text='Site ID (contoh: 20TS10B1529)'
    )
    code = models.CharField(
        max_length=50,
        unique=True,
        help_text='Kode site/device_id (contoh: CKG-04-031-MM)'
    )
    lat = models.FloatField(help_text='Latitude')
    lng = models.FloatField(help_text='Longitude')
    area = models.CharField(
        max_length=50,
        help_text='Area (contoh: AREA 2)'
    )
    region = models.CharField(
        max_length=100,
        help_text='Region'
    )
    kabupaten = models.CharField(
        max_length=100,
        help_text='Kabupaten/Kota'
    )
    status = models.CharField(
        max_length=20,
        default='offline',
        help_text='Status awal'
    )
    towerType = models.CharField(
        max_length=50,
        help_text='Tipe Tower (contoh: SST)'
    )
    towerHeight = models.FloatField(help_text='Tinggi Tower dalam meter')
    isHidden = models.BooleanField(
        default=False,
        help_text='Apakah site disembunyikan secara default?'
    )

    class Meta:
        verbose_name = 'Site'
        verbose_name_plural = 'Sites'

    def __str__(self):
        return f"Site {self.name} ({self.code})"

