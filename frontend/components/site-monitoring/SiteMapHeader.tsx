'use client';

import { MapPin, LogOut, Radio } from 'lucide-react';
import { Site } from '@/data/sites';

interface SiteMapHeaderProps {
    onLogout?: () => void;
    sites?: Site[];
}

export default function SiteMapHeader({ onLogout, sites = [] }: SiteMapHeaderProps) {
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
                <div className="sitemap-stat">
                    <MapPin size={14} />
                    <span className="sitemap-stat-value">{sites.length}</span>
                    <span className="sitemap-stat-label">Total Sites</span>
                </div>
                <div className="sitemap-stat online">
                    <span className="status-dot green" />
                    <span className="sitemap-stat-value">{onlineCount}</span>
                    <span className="sitemap-stat-label">Online</span>
                </div>
                {warningCount > 0 && (
                    <div className="sitemap-stat warning">
                        <span className="status-dot yellow" />
                        <span className="sitemap-stat-value">{warningCount}</span>
                        <span className="sitemap-stat-label">Warning</span>
                    </div>
                )}
                {offlineCount > 0 && (
                    <div className="sitemap-stat offline">
                        <span className="status-dot red" />
                        <span className="sitemap-stat-value">{offlineCount}</span>
                        <span className="sitemap-stat-label">Offline</span>
                    </div>
                )}
            </div>

            {onLogout && (
                <button onClick={onLogout} className="sitemap-logout-btn">
                    <LogOut size={14} />
                    Logout
                </button>
            )}
        </header>
    );
}
