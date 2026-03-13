'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sites, Site } from '@/data/sites';
import { useSitesStatus } from '@/hooks/useSitesStatus';
import SiteMapHeader from '@/components/site-monitoring/SiteMapHeader';
import SiteSidebar from '@/components/site-monitoring/SiteSidebar';
import SiteMap from '@/components/site-monitoring/SiteMap';
import SitePreviewCard from '@/components/site-monitoring/SitePreviewCard';

export default function RectifierSiteMapPage() {
    const { isAuthenticated, logout } = useAuth();
    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [areaFilter, setAreaFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const liveStatuses = useSitesStatus(15000);

    useEffect(() => {
        if (window.innerWidth <= 768) {
            setSidebarOpen(false);
        }
    }, []);

    const liveSites = useMemo(() => {
        if (liveStatuses.length === 0) return sites;
        return sites.map(site => {
            const live = liveStatuses.find(s => s.device_id === site.code);
            if (live) {
                return { ...site, status: live.live_status as Site['status'] };
            }
            return site;
        });
    }, [liveStatuses]);

    const filteredSiteIds = useMemo(() => {
        const hasAreaFilter = areaFilter !== 'all';
        const hasStatusFilter = statusFilter !== null;
        if (!hasAreaFilter && !hasStatusFilter) return undefined;

        const filtered = liveSites.filter(site => {
            const matchesArea = !hasAreaFilter || site.area === areaFilter;
            const matchesStatus = !hasStatusFilter || site.status === statusFilter;
            return matchesArea && matchesStatus;
        });

        return new Set(filtered.map(s => s.id));
    }, [liveSites, areaFilter, statusFilter]);

    if (isAuthenticated === null) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#060912',
            }}>
                <div style={{
                    width: '40px', height: '40px',
                    border: '3px solid rgba(99, 102, 241, 0.2)',
                    borderTop: '3px solid #6366f1',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                }} />
                <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="sitemap-page">
            <SiteMapHeader
                onLogout={logout}
                sites={liveSites}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
            />
            <div className="sitemap-content">
                {sidebarOpen && (
                    <>
                        <div className="mobile-map-overlay" onClick={() => setSidebarOpen(false)} />
                        <SiteSidebar
                            sites={liveSites}
                            selectedSiteId={selectedSite?.id ?? null}
                            onSelectSite={(site) => {
                                setSelectedSite(site);
                                if (window.innerWidth <= 768) {
                                    setSidebarOpen(false);
                                }
                            }}
                            areaFilter={areaFilter}
                            onAreaFilterChange={setAreaFilter}
                            onClose={() => setSidebarOpen(false)}
                        />
                    </>
                )}
                <div className="sitemap-map-wrapper">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="sidebar-toggle-btn"
                        title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {sidebarOpen ? (
                                <>
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <line x1="9" y1="3" x2="9" y2="21" />
                                    <polyline points="15 9 12 12 15 15" />
                                </>
                            ) : (
                                <>
                                    <rect x="3" y="3" width="18" height="18" rx="2" />
                                    <line x1="9" y1="3" x2="9" y2="21" />
                                    <polyline points="13 9 16 12 13 15" />
                                </>
                            )}
                        </svg>
                    </button>
                    <SiteMap
                        sites={liveSites}
                        selectedSite={selectedSite}
                        onSelectSite={(site) => setSelectedSite(site)}
                        sidebarOpen={sidebarOpen}
                        filteredSiteIds={filteredSiteIds}
                    />
                    {selectedSite && (
                        <>
                            <div className="mobile-map-overlay" onClick={() => setSelectedSite(null)} />
                            <div className="sitemap-preview-overlay">
                                <SitePreviewCard
                                    site={liveSites.find(s => s.id === selectedSite.id) ?? selectedSite}
                                    onClose={() => setSelectedSite(null)}
                                />
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
