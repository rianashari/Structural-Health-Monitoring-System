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
    Cocok untuk grafik trend analysis di frontend.
    """
    limit = int(request.query_params.get('limit', 100))
    limit = min(limit, 1000)  # Max 1000 data
    data = SensorData.objects.all()[:limit]
    serializer = SensorDataSerializer(data, many=True)
    return Response(serializer.data)
