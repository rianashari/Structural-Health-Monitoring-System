"""
URL configuration for shm_backend project.
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('monitoring.urls')),
]
