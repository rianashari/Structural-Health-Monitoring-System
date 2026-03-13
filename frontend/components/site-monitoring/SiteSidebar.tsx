'use client';

import { useState } from 'react';
import { Search, MapPin, Signal, ChevronRight, X } from 'lucide-react';
import { Site } from '@/data/sites';

interface SiteSidebarProps {
    sites: Site[];
    selectedSiteId: string | null;
    onSelectSite: (site: Site) => void;
    areaFilter: string;
    onAreaFilterChange: (area: string) => void;
    onClose?: () => void;
}

export default function SiteSidebar({ sites, selectedSiteId, onSelectSite, areaFilter, onAreaFilterChange, onClose }: SiteSidebarProps) {
    const [search, setSearch] = useState('');

    const areas = Array.from(new Set(sites.map(s => s.area))).sort();

    const filtered = sites.filter(s => {
        const matchesSearch =
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.code.toLowerCase().includes(search.toLowerCase()) ||
            s.kabupaten.toLowerCase().includes(search.toLowerCase());
        const matchesArea = areaFilter === 'all' || s.area === areaFilter;
        return matchesSearch && matchesArea;
    });

    const statusColor = (status: string) => {
        if (status === 'online') return '#08b87c';
        if (status === 'warning') return '#eab308';
        return '#f43f5e';
    };

    return (
        <aside className="site-sidebar">
            <div className="site-sidebar-header">
                <h2 className="site-sidebar-title">
                    <MapPin size={16} />
                    Site Directory
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span className="site-sidebar-count">{filtered.length} sites</span>
                    {onClose && (
                        <button className="site-sidebar-close-btn" onClick={onClose} aria-label="Close Sidebar">
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            <div className="site-sidebar-search">
                <Search size={14} className="site-sidebar-search-icon" />
                <input
                    type="text"
                    placeholder="Search site name, code..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="site-sidebar-input"
                />
            </div>

            <div className="site-sidebar-filters">
                <button
                    onClick={() => onAreaFilterChange('all')}
                    className={`site-filter-btn ${areaFilter === 'all' ? 'active' : ''}`}
                >
                    All
                </button>
                {areas.map(area => (
                    <button
                        key={area}
                        onClick={() => onAreaFilterChange(area)}
                        className={`site-filter-btn ${areaFilter === area ? 'active' : ''}`}
                    >
                        {area}
                    </button>
                ))}
            </div>

            <div className="site-sidebar-list">
                {filtered.map(site => (
                    <button
                        key={site.id}
                        onClick={() => onSelectSite(site)}
                        className={`site-sidebar-item ${selectedSiteId === site.id ? 'selected' : ''}`}
                    >
                        <div className="site-sidebar-item-left">
                            <span
                                className="site-sidebar-status-dot"
                                style={{ backgroundColor: statusColor(site.status) }}
                            />
                            <div className="site-sidebar-item-info">
                                <span className="site-sidebar-item-name">{site.name}</span>
                                <span className="site-sidebar-item-code">{site.code}</span>
                            </div>
                        </div>
                        <div className="site-sidebar-item-right">
                            <span className="site-sidebar-item-area">{site.area}</span>
                            <div className="site-sidebar-item-meta">
                                <Signal size={10} />
                                <span>{site.towerHeight}m</span>
                            </div>
                            <ChevronRight size={14} className="site-sidebar-chevron" />
                        </div>
                    </button>
                ))}
                {filtered.length === 0 && (
                    <div className="site-sidebar-empty">
                        <MapPin size={24} style={{ opacity: 0.3 }} />
                        <p>No sites found</p>
                    </div>
                )}
            </div>
        </aside>
    );
}
