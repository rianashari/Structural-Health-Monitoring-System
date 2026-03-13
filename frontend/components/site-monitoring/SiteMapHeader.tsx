'use client';

import { MapPin, LogOut, Radio } from 'lucide-react';
import { Site } from '@/data/sites';

interface SiteMapHeaderProps {
    onLogout?: () => void;
    sites?: Site[];
    statusFilter: string | null;
    onStatusFilterChange: (status: string | null) => void;
}

export default function SiteMapHeader({ onLogout, sites = [], statusFilter, onStatusFilterChange }: SiteMapHeaderProps) {
    const onlineCount = sites.filter(s => s.status === 'online').length;
    const warningCount = sites.filter(s => s.status === 'warning').length;
    const offlineCount = sites.filter(s => s.status === 'offline').length;

    return (
        <header className="sitemap-header">
            <div className="sitemap-header-left">
                <div className="sitemap-logo">
                    <Radio size={20} />
                </div>
                <div>
                    <h1 className="sitemap-title">SHM Site Monitoring</h1>
                    <p className="sitemap-subtitle">Structural Health Monitoring System</p>
                </div>
            </div>

            <div className="sitemap-header-stats">
                <button
                    className={`sitemap-stat ${statusFilter === null ? 'active' : ''}`}
                    onClick={() => onStatusFilterChange(null)}
                    style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}
                >
                    <MapPin size={14} />
                    <span className="sitemap-stat-value">{sites.length}</span>
                    <span className="sitemap-stat-label">Total Sites</span>
                </button>
                <button
                    className={`sitemap-stat online ${statusFilter === 'online' ? 'active' : ''}`}
                    onClick={() => onStatusFilterChange(statusFilter === 'online' ? null : 'online')}
                    style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}
                >
                    <span className="status-dot green" />
                    <span className="sitemap-stat-value">{onlineCount}</span>
                    <span className="sitemap-stat-label">Online</span>
                </button>
                {warningCount > 0 && (
                    <button
                        className={`sitemap-stat warning ${statusFilter === 'warning' ? 'active' : ''}`}
                        onClick={() => onStatusFilterChange(statusFilter === 'warning' ? null : 'warning')}
                        style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}
                    >
                        <span className="status-dot yellow" />
                        <span className="sitemap-stat-value">{warningCount}</span>
                        <span className="sitemap-stat-label">Warning</span>
                    </button>
                )}
                {offlineCount > 0 && (
                    <button
                        className={`sitemap-stat offline ${statusFilter === 'offline' ? 'active' : ''}`}
                        onClick={() => onStatusFilterChange(statusFilter === 'offline' ? null : 'offline')}
                        style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'inherit' }}
                    >
                        <span className="status-dot red" />
                        <span className="sitemap-stat-value">{offlineCount}</span>
                        <span className="sitemap-stat-label">Offline</span>
                    </button>
                )}
            </div>

            {onLogout && (
                <button onClick={onLogout} className="sitemap-logout-btn logout-mobile-btn">
                    <LogOut size={14} />
                    <span className="hide-mobile">Logout</span>
                </button>
            )}
        </header>
    );
}
