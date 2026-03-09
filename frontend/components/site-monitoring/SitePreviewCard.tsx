'use client';

import { useRouter } from 'next/navigation';
import { MapPin, Signal, ExternalLink } from 'lucide-react';
import { Site } from '@/data/sites';

interface SitePreviewCardProps {
    site: Site;
    onClose: () => void;
}

export default function SitePreviewCard({ site, onClose }: SitePreviewCardProps) {
    const router = useRouter();

    const statusColor = (status: string) => {
        if (status === 'online') return '#08b87c';
        if (status === 'warning') return '#eab308';
        return '#f43f5e';
    };

    const statusBg = (status: string) => {
        if (status === 'online') return 'rgba(8, 184, 124, 0.15)';
        if (status === 'warning') return 'rgba(234, 179, 8, 0.15)';
        return 'rgba(244, 63, 94, 0.15)';
    };

    const handleOpenDashboard = () => {
        router.push(`/dashboard/${site.code}`);
    };

    return (
        <div className="site-preview-card">
            <div className="site-preview-header">
                <div className="site-preview-title-wrap">
                    <h3 className="site-preview-name">{site.name}</h3>
                    <span
                        className="site-preview-status"
                        style={{
                            color: statusColor(site.status),
                            background: statusBg(site.status),
                            border: `1px solid ${statusColor(site.status)}33`,
                        }}
                    >
                        <span
                            className="status-dot"
                            style={{ backgroundColor: statusColor(site.status), width: 6, height: 6 }}
                        />
                        {site.status.charAt(0).toUpperCase() + site.status.slice(1)}
                    </span>
                </div>
                <button onClick={onClose} className="site-preview-close">×</button>
            </div>

            <div className="site-preview-body">
                <div className="site-preview-info-row">
                    <span className="site-preview-label">Site ID</span>
                    <span className="site-preview-value font-mono">{site.code}</span>
                </div>
                <div className="site-preview-info-row">
                    <span className="site-preview-label">
                        <MapPin size={12} /> Location
                    </span>
                    <span className="site-preview-value">{site.kabupaten}</span>
                </div>
                <div className="site-preview-info-row">
                    <span className="site-preview-label">Region</span>
                    <span className="site-preview-value">{site.region}</span>
                </div>
                <div className="site-preview-info-row">
                    <span className="site-preview-label">
                        <Signal size={12} /> Tinggi
                    </span>
                    <span className="site-preview-value">{site.towerHeight} Meter</span>
                </div>
                <div className="site-preview-info-row">
                    <span className="site-preview-label">Tower</span>
                    <span className="site-preview-value">{site.towerType}</span>
                </div>
                <div className="site-preview-info-row">
                    <span className="site-preview-label">Coordinates</span>
                    <span className="site-preview-value font-mono" style={{ fontSize: '0.65rem' }}>
                        {site.lat.toFixed(5)}, {site.lng.toFixed(5)}
                    </span>
                </div>
            </div>

            <button onClick={handleOpenDashboard} className="site-preview-btn">
                <ExternalLink size={14} />
                Open Dashboard
            </button>
        </div>
    );
}
