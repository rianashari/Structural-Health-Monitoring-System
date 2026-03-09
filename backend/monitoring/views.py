from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Max, Subquery, OuterRef
from django.utils import timezone
from .models import SensorData
from .serializers import SensorDataSerializer


class SensorDataListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/sensor-data/     → List semua sensor data (terbaru di atas, paginated)
    POST /api/sensor-data/     → Tambah data sensor baru

    Query params:
        ?device_id=CKG-04-031-MM  → Filter by device
    """
    serializer_class = SensorDataSerializer

    def get_queryset(self):
        queryset = SensorData.objects.all()
        device_id = self.request.query_params.get('device_id')
        if device_id:
            queryset = queryset.filter(device_id=device_id)
        return queryset


@api_view(['GET'])
def sensor_data_latest(request):
    """
    GET /api/sensor-data/latest/ → Ambil data sensor terbaru
    GET /api/sensor-data/latest/?device_id=CKG-04-031-MM → Terbaru untuk device tertentu
    """
    queryset = SensorData.objects.all()

    device_id = request.query_params.get('device_id')
    if device_id:
        queryset = queryset.filter(device_id=device_id)

    latest = queryset.first()  # Ordering sudah -timestamp dari model Meta
    if latest is None:
        return Response(
            {'detail': 'Belum ada data sensor.'},
            status=status.HTTP_404_NOT_FOUND
        )
    serializer = SensorDataSerializer(latest)
    return Response(serializer.data)


@api_view(['GET'])
def sensor_data_history(request):
    """
    GET /api/sensor-data/history/?limit=100 → Ambil N data terakhir (default: 100)
    GET /api/sensor-data/history/?device_id=CKG-04-031-MM → Filter by device
    GET /api/sensor-data/history/?start_date=2026-03-01&end_date=2026-03-04 → Filter by date range
    """
    from django.utils.dateparse import parse_date
    from datetime import datetime, time

    data = SensorData.objects.all()

    # Filter by device_id
    device_id = request.query_params.get('device_id')
    if device_id:
        data = data.filter(device_id=device_id)

    # Filter by date range
    start_date_str = request.query_params.get('start_date')
    end_date_str = request.query_params.get('end_date')

    if start_date_str:
        start_date = parse_date(start_date_str)
        if start_date:
            start_datetime = datetime.combine(start_date, time.min)
            data = data.filter(timestamp__gte=start_datetime)

    if end_date_str:
        end_date = parse_date(end_date_str)
        if end_date:
            end_datetime = datetime.combine(end_date, time.max)
            data = data.filter(timestamp__lte=end_datetime)

    limit = int(request.query_params.get('limit', 100))
    limit = min(limit, 5000)  # Max 5000 data for report exports
    data = data[:limit]
    serializer = SensorDataSerializer(data, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def sensor_data_sites_status(request):
    """
    GET /api/sensor-data/sites-status/ → Get latest reading per device_id with live status.
    Returns one entry per device with status: online (< 5min), warning (< 30min), offline (> 30min).
    """
    from datetime import timedelta

    now = timezone.now()
    threshold_online = now - timedelta(minutes=5)
    threshold_warning = now - timedelta(minutes=30)

    # Get latest timestamp per device_id
    latest_ids = (
        SensorData.objects
        .values('device_id')
        .annotate(latest_id=Max('id'))
        .values_list('latest_id', flat=True)
    )

    latest_records = SensorData.objects.filter(id__in=latest_ids).order_by('device_id')

    results = []
    for record in latest_records:
        if record.timestamp >= threshold_online:
            live_status = 'online'
        elif record.timestamp >= threshold_warning:
            live_status = 'warning'
        else:
            live_status = 'offline'

        data = SensorDataSerializer(record).data
        data['live_status'] = live_status
        results.append(data)

    return Response(results)
