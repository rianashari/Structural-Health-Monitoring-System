'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Site } from '@/data/sites';

interface SiteMapProps {
    sites: Site[];
    selectedSite: Site | null;
    onSelectSite: (site: Site) => void;
    sidebarOpen?: boolean;
}

export default function SiteMap({ sites, selectedSite, onSelectSite, sidebarOpen }: SiteMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markersRef = useRef<Map<string, L.Marker>>(new Map());
    const leafletRef = useRef<typeof import('leaflet') | null>(null);
    const onSelectSiteRef = useRef(onSelectSite);
    const sitesRef = useRef(sites);

    // Keep refs current
    onSelectSiteRef.current = onSelectSite;
    sitesRef.current = sites;

    const createIcon = useCallback((L: typeof import('leaflet'), status: string) => {
        const color = status === 'online' ? '#08b87c' : status === 'warning' ? '#eab308' : '#f43f5e';
        const glowColor = status === 'online' ? 'rgba(8,184,124,0.4)' : status === 'warning' ? 'rgba(234,179,8,0.4)' : 'rgba(244,63,94,0.4)';

        return L.divIcon({
            className: 'custom-site-marker',
            html: `
            <div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
              <div style="position:absolute;width:32px;height:32px;border-radius:50%;background:${glowColor};animation:markerPulse 2s ease-in-out infinite;"></div>
              <div style="position:relative;width:16px;height:16px;border-radius:50%;background:${color};border:2.5px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);z-index:2;"></div>
            </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
        });
    }, []);

    // Initialize map (once)
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        import('leaflet').then((L) => {
            // Guard against React StrictMode double-mount (check AFTER async import)
            if (!mapRef.current || mapInstanceRef.current) return;
            const el = mapRef.current as HTMLDivElement & { _leaflet_id?: number };
            if (el._leaflet_id) return;

            leafletRef.current = L;

            delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            });

            const map = L.map(mapRef.current!, {
                center: [-6.5, 108.5],
                zoom: 7,
                minZoom: 5,
                zoomControl: false,
                attributionControl: false,
            });

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                maxZoom: 19,
            }).addTo(map);

            L.control.zoom({ position: 'bottomright' }).addTo(map);

            mapInstanceRef.current = map;

            // Create markers using the LATEST sites data (via ref)
            const currentSites = sitesRef.current;
            currentSites.forEach(site => {
                const marker = L.marker([site.lat, site.lng], {
                    icon: createIcon(L, site.status),
                }).addTo(map);

                marker.on('click', () => {
                    onSelectSiteRef.current(site);
                    map.flyTo([site.lat, site.lng], 12, { duration: 0.8 });
                });

                marker.bindTooltip(
                    `<div style="font-weight:600;font-size:12px;">${site.name}</div><div style="font-size:10px;opacity:0.7;">${site.code}</div>`,
                    {
                        direction: 'top',
                        offset: [0, -16],
                        className: 'site-marker-tooltip',
                    }
                );

                markersRef.current.set(site.id, marker);
            });

            // Fit bounds
            if (currentSites.length > 0) {
                const group = L.featureGroup(Array.from(markersRef.current.values()));
                map.fitBounds(group.getBounds().pad(0.15));
            }
        });

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                leafletRef.current = null;
                markersRef.current.clear();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update marker icons when sites data changes (live status updates)
    useEffect(() => {
        const L = leafletRef.current;
        if (!L || !mapInstanceRef.current) return;

        sites.forEach(site => {
            const marker = markersRef.current.get(site.id);
            if (marker) {
                marker.setIcon(createIcon(L, site.status));
            }
        });
    }, [sites, createIcon]);

    // Fly to selected site
    useEffect(() => {
        if (selectedSite && mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([selectedSite.lat, selectedSite.lng], 12, { duration: 0.8 });
        }
    }, [selectedSite]);

    // Invalidate map size when sidebar toggles
    useEffect(() => {
        if (mapInstanceRef.current) {
            setTimeout(() => {
                mapInstanceRef.current?.invalidateSize();
            }, 50);
        }
    }, [sidebarOpen]);

    return (
        <>
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css"
            />
            <div ref={mapRef} className="site-map-leaflet" />
            <style>{`
        @keyframes markerPulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.6); opacity: 0; }
        }
        .site-marker-tooltip {
          background: rgba(255, 255, 255, 0.96) !important;
          border: 1px solid rgba(0,0,0,0.08) !important;
          border-radius: 8px !important;
          padding: 6px 10px !important;
          color: #1e293b !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12) !important;
          font-family: 'Inter', sans-serif !important;
        }
        .site-marker-tooltip::before {
          border-top-color: rgba(255, 255, 255, 0.96) !important;
        }
        .leaflet-control-zoom a {
          background: rgba(255, 255, 255, 0.95) !important;
          color: #1e293b !important;
          border-color: rgba(0,0,0,0.08) !important;
        }
        .leaflet-control-zoom a:hover {
          background: #fff !important;
        }
      `}</style>
        </>
    );
}
