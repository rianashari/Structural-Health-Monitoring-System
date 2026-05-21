'use client';

import { useState, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Site } from '@/data/sites';
import { useSitesStatus } from '@/hooks/useSitesStatus';
import SiteMapHeader from '@/components/site-monitoring/SiteMapHeader';
import SiteSidebar from '@/components/site-monitoring/SiteSidebar';
import SiteMap from '@/components/site-monitoring/SiteMap';
import SitePreviewCard from '@/components/site-monitoring/SitePreviewCard';
import { useSiteVisibility } from '@/hooks/useSiteVisibility';
import { useSites } from '@/hooks/useSites';

export default function RectifierSiteMapPage() {
    const { isAuthenticated, isSuperAdmin, logout } = useAuth();
    const { sites: dbSites, loading: sitesLoading, error: sitesError, addSite, updateSite, deleteSite } = useSites();
    const { hiddenSiteIds, toggleVisibility, isLoading: visibilityLoading } = useSiteVisibility(dbSites);

    const [selectedSite, setSelectedSite] = useState<Site | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [areaFilter, setAreaFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [showSettings, setShowSettings] = useState(false);

    // CRUD/Admin Panel states
    const [settingsTab, setSettingsTab] = useState<'visibility' | 'crud'>('visibility');
    const [editingSite, setEditingSite] = useState<Site | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    // Form states
    const [formId, setFormId] = useState('');
    const [formName, setFormName] = useState('');
    const [formSiteId, setFormSiteId] = useState('');
    const [formCode, setFormCode] = useState('');
    const [formLat, setFormLat] = useState(0);
    const [formLng, setFormLng] = useState(0);
    const [formArea, setFormArea] = useState('AREA 2');
    const [formRegion, setFormRegion] = useState('');
    const [formKabupaten, setFormKabupaten] = useState('');
    const [formTowerType, setFormTowerType] = useState('SST');
    const [formTowerHeight, setFormTowerHeight] = useState(42);
    const [formIsHidden, setFormIsHidden] = useState(false);
    const [formError, setFormError] = useState('');

    const liveStatuses = useSitesStatus(15000);

    useEffect(() => {
        if (window.innerWidth <= 768) {
            setSidebarOpen(false);
        }
    }, []);

    const liveSites = useMemo(() => {
        let visibleSites = dbSites.filter(s => !hiddenSiteIds.has(s.id));

        if (liveStatuses.length === 0) return visibleSites;
        return visibleSites.map(site => {
            const live = liveStatuses.find(s => s.device_id === site.code);
            if (live) {
                return { ...site, status: live.live_status as Site['status'] };
            }
            return site;
        });
    }, [dbSites, liveStatuses, hiddenSiteIds]);

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

    const handleOpenCreateForm = () => {
        setFormId('');
        setFormName('');
        setFormSiteId('');
        setFormCode('');
        setFormLat(0);
        setFormLng(0);
        setFormArea('AREA 2');
        setFormRegion('');
        setFormKabupaten('');
        setFormTowerType('SST');
        setFormTowerHeight(42);
        setFormIsHidden(false);
        setFormError('');
        setIsCreating(true);
        setEditingSite(null);
    };

    const handleOpenEditForm = (site: Site) => {
        setFormId(site.id);
        setFormName(site.name);
        setFormSiteId(site.siteId);
        setFormCode(site.code);
        setFormLat(site.lat);
        setFormLng(site.lng);
        setFormArea(site.area);
        setFormRegion(site.region);
        setFormKabupaten(site.kabupaten);
        setFormTowerType(site.towerType);
        setFormTowerHeight(site.towerHeight);
        setFormIsHidden(!!site.isHidden);
        setFormError('');
        setEditingSite(site);
        setIsCreating(false);
    };

    const handleSaveSite = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');

        if (!formId || !formName || !formSiteId || !formCode || !formLat || !formLng || !formRegion || !formKabupaten) {
            setFormError('Semua field wajib diisi!');
            return;
        }

        const sitePayload: Site = {
            id: formId.trim().toLowerCase(),
            name: formName.trim(),
            siteId: formSiteId.trim(),
            code: formCode.trim().toUpperCase(),
            lat: parseFloat(formLat.toString()),
            lng: parseFloat(formLng.toString()),
            area: formArea,
            region: formRegion.trim(),
            kabupaten: formKabupaten.trim(),
            status: isCreating ? 'offline' : (editingSite?.status || 'offline'),
            towerType: formTowerType,
            towerHeight: parseFloat(formTowerHeight.toString()),
            isHidden: formIsHidden,
        };

        let success = false;
        if (isCreating) {
            // Cek duplikasi ID atau Code
            const duplicateId = dbSites.some(s => s.id === sitePayload.id);
            const duplicateCode = dbSites.some(s => s.code === sitePayload.code);
            if (duplicateId) {
                setFormError('Site ID lokal (ID) sudah digunakan.');
                return;
            }
            if (duplicateCode) {
                setFormError('Kode Site/Device ID sudah digunakan.');
                return;
            }
            success = await addSite(sitePayload);
        } else if (editingSite) {
            success = await updateSite(editingSite.id, sitePayload);
        }

        if (success) {
            setEditingSite(null);
            setIsCreating(false);
        } else {
            setFormError('Gagal menyimpan data site ke server.');
        }
    };

    const handleDeleteSite = async (id: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus site ini secara permanen dari server?')) {
            const success = await deleteSite(id);
            if (!success) {
                alert('Gagal menghapus site dari server.');
            }
        }
    };

    if (isAuthenticated === null || visibilityLoading || sitesLoading) {
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
                onToggleHidden={() => {
                    setSettingsTab('visibility');
                    setShowSettings(true);
                }}
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

                {/* Settings & CRUD Modal */}
                {showSettings && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.6)' }} onClick={() => setShowSettings(false)}>
                        <div style={{ background: '#111827', border: '1px solid #374151', padding: '24px', borderRadius: '12px', width: '90%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
                            
                            {/* Tabs Header */}
                            <div style={{ display: 'flex', borderBottom: '1px solid #374151', marginBottom: '16px', gap: '16px' }}>
                                <button
                                    onClick={() => { setSettingsTab('visibility'); setIsCreating(false); setEditingSite(null); }}
                                    style={{
                                        paddingBottom: '8px',
                                        color: settingsTab === 'visibility' ? '#6366f1' : '#9ca3af',
                                        borderTop: 'none',
                                        borderLeft: 'none',
                                        borderRight: 'none',
                                        borderBottom: settingsTab === 'visibility' ? '2px solid #6366f1' : '2px solid transparent',
                                        background: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '15px'
                                    }}
                                >
                                    Visibilitas Site
                                </button>
                                {isSuperAdmin && (
                                    <button
                                        onClick={() => setSettingsTab('crud')}
                                        style={{
                                            paddingBottom: '8px',
                                            color: settingsTab === 'crud' ? '#6366f1' : '#9ca3af',
                                            borderTop: 'none',
                                            borderLeft: 'none',
                                            borderRight: 'none',
                                            borderBottom: settingsTab === 'crud' ? '2px solid #6366f1' : '2px solid transparent',
                                            background: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '15px'
                                        }}
                                    >
                                        Kelola Database Site
                                    </button>
                                )}
                            </div>

                            {/* Visibility Content */}
                            {settingsTab === 'visibility' && (
                                <>
                                    <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px', color: '#f3f4f6' }}>Site Visibility Settings</h2>
                                    <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '20px' }}>Select the sites you want to display on the dashboard.</p>
                                    
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {dbSites.map(site => (
                                            <label key={site.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px', background: '#1f2937', borderRadius: '6px', border: '1px solid #374151' }}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={!hiddenSiteIds.has(site.id)} 
                                                    onChange={() => toggleVisibility(site.id)}
                                                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#4f46e5' }}
                                                />
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ color: '#e5e7eb', fontWeight: '500' }}>{site.code}</span>
                                                    <span style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{site.name}</span>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}

                            {/* CRUD Content */}
                            {settingsTab === 'crud' && !editingSite && !isCreating && (
                                <div style={{ color: '#e5e7eb' }}>
                                    <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '16px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Daftar Site Terdaftar</h3>
                                        <button 
                                            onClick={handleOpenCreateForm}
                                            style={{ padding: '8px 12px', background: '#6366f1', border: 'none', borderRadius: '6px', color: 'white', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                                        >
                                            + Tambah Site
                                        </button>
                                    </div>

                                    {sitesError && <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '12px' }}>{sitesError}</p>}

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {dbSites.map(site => (
                                            <div key={site.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px' }}>
                                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                    <span style={{ fontWeight: '600' }}>{site.name}</span>
                                                    <span style={{ fontSize: '11px', color: '#9ca3af' }}>{site.code} ({site.siteId})</span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button 
                                                        onClick={() => handleOpenEditForm(site)}
                                                        style={{ background: '#374151', border: 'none', borderRadius: '4px', padding: '6px 10px', color: '#818cf8', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteSite(site.id)}
                                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '4px', padding: '6px 10px', color: '#f87171', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                                                    >
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* CRUD Form (Create / Edit) */}
                            {settingsTab === 'crud' && (editingSite || isCreating) && (
                                <form onSubmit={handleSaveSite} style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: '#e5e7eb' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                                        {isCreating ? 'Tambah Site Baru' : `Edit Site: ${editingSite?.name}`}
                                    </h3>

                                    {formError && <p style={{ color: '#f87171', fontSize: '12px', padding: '8px', background: 'rgba(248, 113, 113, 0.1)', border: '1px solid rgba(248, 113, 113, 0.2)', borderRadius: '6px' }}>{formError}</p>}

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>ID Site Lokal (slug)</label>
                                            <input 
                                                type="text" 
                                                value={formId} 
                                                onChange={e => setFormId(e.target.value)}
                                                placeholder="contoh: ckg-04-031"
                                                disabled={!isCreating}
                                                style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Nama Site</label>
                                            <input 
                                                type="text" 
                                                value={formName} 
                                                onChange={e => setFormName(e.target.value)}
                                                placeholder="contoh: SWADAYA"
                                                style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Official Site ID</label>
                                            <input 
                                                type="text" 
                                                value={formSiteId} 
                                                onChange={e => setFormSiteId(e.target.value)}
                                                placeholder="contoh: 20TS10B1529"
                                                style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Kode Site/Device ID (MQTT)</label>
                                            <input 
                                                type="text" 
                                                value={formCode} 
                                                onChange={e => setFormCode(e.target.value)}
                                                placeholder="contoh: CKG-04-031-MM"
                                                style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Latitude</label>
                                            <input 
                                                type="number" 
                                                step="any"
                                                value={formLat || ''} 
                                                onChange={e => setFormLat(parseFloat(e.target.value) || 0)}
                                                placeholder="contoh: -6.237318"
                                                style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Longitude</label>
                                            <input 
                                                type="number" 
                                                step="any"
                                                value={formLng || ''} 
                                                onChange={e => setFormLng(parseFloat(e.target.value) || 0)}
                                                placeholder="contoh: 106.919108"
                                                style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Area</label>
                                            <select 
                                                value={formArea}
                                                onChange={e => setFormArea(e.target.value)}
                                                style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                                            >
                                                <option value="AREA 1">AREA 1</option>
                                                <option value="AREA 2">AREA 2</option>
                                                <option value="AREA 3">AREA 3</option>
                                                <option value="AREA 4">AREA 4</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Tipe Tower</label>
                                            <input 
                                                type="text" 
                                                value={formTowerType} 
                                                onChange={e => setFormTowerType(e.target.value)}
                                                placeholder="contoh: SST"
                                                style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Tinggi Tower (meter)</label>
                                            <input 
                                                type="number" 
                                                step="any"
                                                value={formTowerHeight || ''} 
                                                onChange={e => setFormTowerHeight(parseFloat(e.target.value) || 0)}
                                                placeholder="contoh: 42"
                                                style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Region</label>
                                            <input 
                                                type="text" 
                                                value={formRegion} 
                                                onChange={e => setFormRegion(e.target.value)}
                                                placeholder="contoh: Provinsi DKI Jakarta"
                                                style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Kabupaten/Kota</label>
                                        <input 
                                            type="text" 
                                            value={formKabupaten} 
                                            onChange={e => setFormKabupaten(e.target.value)}
                                            placeholder="contoh: Kota Adm. Jakarta Timur"
                                            style={{ width: '100%', padding: '8px', background: '#1f2937', border: '1px solid #374151', borderRadius: '6px', color: 'white', fontSize: '13px' }}
                                        />
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '4px 0' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={formIsHidden}
                                            onChange={e => setFormIsHidden(e.target.checked)}
                                            id="formIsHidden"
                                            style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                        />
                                        <label htmlFor="formIsHidden" style={{ fontSize: '13px', cursor: 'pointer' }}>Sembunyikan site dari dashboard default (isHidden)</label>
                                    </div>

                                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                        <button 
                                            type="button" 
                                            onClick={() => { setEditingSite(null); setIsCreating(false); }}
                                            style={{ flex: 1, padding: '10px', background: '#374151', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Batal
                                        </button>
                                        <button 
                                            type="submit" 
                                            style={{ flex: 1, padding: '10px', background: '#6366f1', border: 'none', borderRadius: '6px', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                                        >
                                            Simpan Site
                                        </button>
                                    </div>
                                </form>
                            )}

                            {/* Done Button (if not editing or creating) */}
                            {(!editingSite && !isCreating) && (
                                <button 
                                    onClick={() => setShowSettings(false)} 
                                    style={{ marginTop: '24px', width: '100%', padding: '12px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
                                >
                                    Selesai
                                </button>
                            )}
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
