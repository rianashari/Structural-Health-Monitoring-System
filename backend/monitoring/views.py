from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import SensorData
from .serializers import SensorDataSerializer


class SensorDataListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/sensor-data/     → List semua sensor data (terbaru di atas, paginated)
    POST /api/sensor-data/     → Tambah data sensor baru
    """
    queryset = SensorData.objects.all()
    serializer_class = SensorDataSerializer


@api_view(['GET'])
def sensor_data_latest(request):
    """
    GET /api/sensor-data/latest/ → Ambil data sensor terbaru
    """
    latest = SensorData.objects.first()  # Ordering sudah -timestamp dari model Meta
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
    GET /api/sensor-data/history/?start_date=2026-03-01&end_date=2026-03-04 → Filter by date range
    Cocok untuk grafik trend analysis dan report export di frontend.
    """
    from django.utils.dateparse import parse_date
    from datetime import datetime, time

    data = SensorData.objects.all()

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
