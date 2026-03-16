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
    const [showSettings, setShowSettings] = useState(false);
    const [hiddenSiteIds, setHiddenSiteIds] = useState<Set<string>>(new Set());
    const liveStatuses = useSitesStatus(15000);

    useEffect(() => {
        if (window.innerWidth <= 768) {
            setSidebarOpen(false);
        }
        
        try {
            const saved = localStorage.getItem('hiddenSites');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    setHiddenSiteIds(new Set(parsed));
                }
            } else {
                const initialHidden = sites.filter(s => s.isHidden).map(s => s.id);
                setHiddenSiteIds(new Set(initialHidden));
            }
        } catch (e) {}
    }, []);

    const toggleSiteVisibility = (siteId: string) => {
        const newHidden = new Set(hiddenSiteIds);
        if (newHidden.has(siteId)) {
            newHidden.delete(siteId);
        } else {
            newHidden.add(siteId);
        }
        setHiddenSiteIds(newHidden);
        localStorage.setItem('hiddenSites', JSON.stringify(Array.from(newHidden)));
    };

    const liveSites = useMemo(() => {
        let visibleSites = sites.filter(s => !hiddenSiteIds.has(s.id));

        if (liveStatuses.length === 0) return visibleSites;
        return visibleSites.map(site => {
            const live = liveStatuses.find(s => s.device_id === site.code);
            if (live) {
                return { ...site, status: live.live_status as Site['status'] };
            }
            return site;
        });
    }, [liveStatuses, hiddenSiteIds]);

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
                onToggleHidden={() => setShowSettings(true)}
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

                {/* Settings Modal */}
                {showSettings && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setShowSettings(false)}>
                        <div style={{ background: '#111827', border: '1px solid #374151', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '400px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                            <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#f3f4f6' }}>Site Visibility Settings</h2>
                            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>Select the sites you want to display on the dashboard.</p>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {sites.map(site => (
                                    <label key={site.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px', background: '#1f2937', borderRadius: '6px', border: '1px solid #374151' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={!hiddenSiteIds.has(site.id)} 
                                            onChange={() => toggleSiteVisibility(site.id)}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#4f46e5' }}
                                        />
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ color: '#e5e7eb', fontWeight: '500' }}>{site.code}</span>
                                            <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{site.name}</span>
                                        </div>
                                    </label>
                                ))}
                            </div>

                            <button onClick={() => setShowSettings(false)} style={{ marginTop: '24px', width: '100%', padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                                Done
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
