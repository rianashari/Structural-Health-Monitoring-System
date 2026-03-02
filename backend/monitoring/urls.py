from django.urls import path
from . import views

urlpatterns = [
    path('sensor-data/', views.SensorDataListCreateView.as_view(), name='sensor-data-list'),
    path('sensor-data/latest/', views.sensor_data_latest, name='sensor-data-latest'),
    path('sensor-data/history/', views.sensor_data_history, name='sensor-data-history'),
]
