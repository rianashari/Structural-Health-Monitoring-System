from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Max, Subquery, OuterRef
from django.utils import timezone
from .models import SensorData, SiteVisibility, Site
from .serializers import SensorDataSerializer, SiteVisibilitySerializer, SiteSerializer


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
    Returns one entry per device with status: online (< 2min), warning (< 5min), offline (> 5min).
    """
    from datetime import timedelta

    now = timezone.now()
    threshold_online = now - timedelta(minutes=2)
    threshold_warning = now - timedelta(minutes=5)

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


from rest_framework.views import APIView

class SiteVisibilityView(APIView):
    """
    GET /api/sensor-data/sites-visibility/ -> Ambil daftar visibility semua site.
    POST /api/sensor-data/sites-visibility/ -> Update (upsert) visibilitas site.
    """
    def get(self, request):
        queryset = SiteVisibility.objects.all()
        serializer = SiteVisibilitySerializer(queryset, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data
        if not isinstance(data, list):
            return Response({"error": "Expected a list of boolean mappings"}, status=status.HTTP_400_BAD_REQUEST)
        
        updated = []
        for item in data:
            device_id = item.get('device_id')
            is_hidden = item.get('is_hidden', False)
            if device_id:
                obj, created = SiteVisibility.objects.update_or_create(
                    device_id=device_id,
                    defaults={'is_hidden': is_hidden}
                )
                updated.append(obj)
                
        serializer = SiteVisibilitySerializer(updated, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class SiteListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/sensor-data/sites/     → List semua site (dengan auto-seeding jika kosong)
    POST /api/sensor-data/sites/     → Tambah site baru
    """
    queryset = Site.objects.all()
    serializer_class = SiteSerializer
    pagination_class = None

    def get_queryset(self):
        # Auto-seeding jika tabel Site kosong
        if Site.objects.count() == 0:
            self.seed_default_sites()
        return Site.objects.all()

    def seed_default_sites(self):
        default_sites = [
            {
                'id': 'ckg-04-031',
                'name': 'SWADAYA',
                'siteId': '20TS10B1529',
                'code': 'CKG-04-031-MM',
                'lat': -6.237318,
                'lng': 106.919108,
                'area': 'AREA 2',
                'region': 'Jabodetabek Provinsi DKI Jakarta',
                'kabupaten': 'Kota Adm. Jakarta Timur',
                'status': 'online',
                'towerType': 'SST',
                'towerHeight': 42,
            },
            {
                'id': 'bks-04-079',
                'name': 'Jalan Mustikasari',
                'siteId': '13TS11B2492',
                'code': 'BKS-04-079-MS',
                'lat': -6.30162,
                'lng': 106.99875,
                'area': 'AREA 2',
                'region': 'Jabodetabek Provinsi Jawa Barat',
                'kabupaten': 'Kota Bekasi',
                'status': 'online',
                'towerType': 'SST',
                'towerHeight': 42,
            },
            {
                'id': 'ggp-04-196',
                'name': 'SMU 84',
                'siteId': '13TS10L1554',
                'code': 'GGP-04-196-MS',
                'lat': -6.146773,
                'lng': 106.70305,
                'area': 'AREA 2',
                'region': 'Jabodetabek Provinsi Jawa Barat',
                'kabupaten': 'Kota Bekasi',
                'status': 'online',
                'towerType': 'SST',
                'towerHeight': 52,
            },
            {
                'id': 'ckr-04-181',
                'name': 'Pedurenan Mustikajaya',
                'siteId': '13TS05W0345',
                'code': 'CKR-04-181-MG',
                'lat': -6.30698,
                'lng': 107.01621,
                'area': 'AREA 2',
                'region': 'Jabodetabek Provinsi Jawa Barat',
                'kabupaten': 'Kabupaten Bekasi',
                'status': 'online',
                'towerType': 'SST',
                'towerHeight': 52,
            },
            {
                'id': 'spa-05-017',
                'name': 'Kertamukti Cikondang',
                'siteId': '12TS05B0032',
                'code': 'SPA-05-017-MS',
                'lat': -7.806772,
                'lng': 108.341564,
                'area': 'AREA 2',
                'region': 'Jawa Barat',
                'kabupaten': 'Kabupaten Tasikmalaya',
                'status': 'offline',
                'towerType': 'SST',
                'towerHeight': 42,
            },
            {
                'id': 'cms-05-279',
                'name': 'Permanenisasi Cikongsu Karesik Isidamulih',
                'siteId': '12TS10B0567',
                'code': 'CMS-05-279-NA',
                'lat': -7.67537,
                'lng': 108.59716,
                'area': 'AREA 2',
                'region': 'Jawa Barat',
                'kabupaten': 'Kabupaten Sumedang',
                'status': 'online',
                'towerType': 'SST',
                'towerHeight': 61,
            },
            {
                'id': 'kds-06-039',
                'name': 'Ngembalrejo',
                'siteId': '19IS11B0523',
                'code': 'KDS-06-039-MS',
                'lat': -6.80439,
                'lng': 110.88274,
                'area': 'AREA 3',
                'region': 'Jawa Tengah',
                'kabupaten': 'Kabupaten Kudus',
                'status': 'online',
                'towerType': 'SST',
                'towerHeight': 72,
                'isHidden': True,
            },
            {
                'id': 'pti-06-080',
                'name': 'Pati Alun-Alun',
                'siteId': '21TS02B3066',
                'code': 'PTI-06-080-MS',
                'lat': -6.751583,
                'lng': 111.039556,
                'area': 'AREA 3',
                'region': 'Jawa Tengah',
                'kabupaten': 'Kabupaten Pati',
                'status': 'warning',
                'towerType': 'SST',
                'towerHeight': 72,
                'isHidden': True,
            },
            {
                'id': 'tbn-07-059',
                'name': 'Banjarejo Bancar',
                'siteId': '18TS07B0118',
                'code': 'TBN-07-059-MS',
                'lat': -6.77378,
                'lng': 111.72506,
                'area': 'AREA 3',
                'region': 'Jawa Timur',
                'kabupaten': 'Kabupaten Tuban',
                'status': 'online',
                'towerType': 'SST',
                'towerHeight': 42,
                'isHidden': True,
            },
            {
                'id': 'krs-07-020',
                'name': 'Sumber Taman 2',
                'siteId': '13TS01B0245',
                'code': 'KRS-07-020-MS',
                'lat': -7.76792,
                'lng': 113.24447,
                'area': 'AREA 3',
                'region': 'Jawa Timur',
                'kabupaten': 'Kabupaten Probolinggo',
                'status': 'online',
                'towerType': 'Monopole',
                'towerHeight': 30,
                'isHidden': True,
            },
        ]
        for s in default_sites:
            Site.objects.get_or_create(id=s['id'], defaults=s)


class SiteRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/sensor-data/sites/<pk>/ → Get detail site
    PUT    /api/sensor-data/sites/<pk>/ → Update site
    DELETE /api/sensor-data/sites/<pk>/ → Hapus site
    """
    queryset = Site.objects.all()
    serializer_class = SiteSerializer

