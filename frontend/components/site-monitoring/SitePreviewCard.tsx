'use client';

import { useRouter } from 'next/navigation';
import { MapPin, Signal, ExternalLink, Activity, Wind, Compass, ArrowRightLeft, Droplet, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Site } from '@/data/sites';
import { useSensorData } from '@/hooks/useSensorData';

interface SitePreviewCardProps {
    site: Site;
    onClose: () => void;
}

export default function SitePreviewCard({ site, onClose }: SitePreviewCardProps) {
    const router = useRouter();
    const { latest } = useSensorData(5000, site.code);

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

    const windSpeed = latest?.wind_speed ?? 0;
    const roll = latest?.roll ?? 0;
    const sway = latest?.sway ?? 0;
    const totalTilt = latest?.total_tilt ?? 0;

    const indikator = latest?.indikator ?? 'tolerance';
    const isTolerance = indikator === 'tolerance';

    const towerStatus = isTolerance ? 'TOLERANCE' : 'INTOLERANCE';
    const alertColor = isTolerance ? 'var(--accent-green)' : 'var(--accent-red)';
    const alertBg = isTolerance ? 'rgba(8, 184, 124, 0.1)' : 'rgba(244, 63, 94, 0.15)';
    const alertBorder = isTolerance ? 'rgba(8, 184, 124, 0.4)' : 'rgba(244, 63, 94, 0.6)';
    const recommendation = isTolerance
        ? 'System structural integrity is optimal.'
        : 'Intolerance detected. Immediate inspection advised.';

    const handleOpenDashboard = () => {
        router.push(`/dashboard/${site.code}`);
    };

    return (
        <div className="site-preview-card">
            <div className="site-preview-header">
                <div className="site-preview-title-wrap" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
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
                    <span className="site-preview-label">
                        <Signal size={12} /> Tinggi
                    </span>
                    <span className="site-preview-value">{site.towerHeight} Meter</span>
                </div>
                <div className="site-preview-info-row">
                    <span className="site-preview-label">Tower</span>
                    <span className="site-preview-value">{site.towerType}</span>
                </div>

                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Live Telemetry</div>

                    <div className="site-preview-info-row" style={{ marginBottom: '0.25rem' }}>
                        <span className="site-preview-label"><Wind size={10} style={{ marginRight: '4px' }} /> Wind Speed</span>
                        <span className="site-preview-value font-mono" style={{ fontSize: '0.7rem' }}>{latest ? latest.wind_speed.toFixed(2) : '--'} km/h</span>
                    </div>
                    {/* <div className="site-preview-info-row" style={{ marginBottom: '0.25rem' }}>
                        <span className="site-preview-label"><Compass size={10} style={{ marginRight: '4px' }} /> Pitch</span>
                        <span className="site-preview-value font-mono" style={{ fontSize: '0.7rem' }}>{latest ? latest.pitch.toFixed(3) : '--'}°</span>
                    </div> */}
                    {/* <div className="site-preview-info-row" style={{ marginBottom: '0.25rem' }}>
                        <span className="site-preview-label"><Activity size={10} style={{ marginRight: '4px' }} /> Roll</span>
                        <span className="site-preview-value font-mono" style={{ fontSize: '0.7rem' }}>{latest ? latest.roll.toFixed(3) : '--'}°</span>
                    </div> */}
                    <div className="site-preview-info-row" style={{ marginBottom: '0.25rem' }}>
                        <span className="site-preview-label"><ArrowRightLeft size={10} style={{ marginRight: '4px' }} /> Sway</span>
                        <span className="site-preview-value font-mono" style={{ fontSize: '0.7rem' }}>{latest ? latest.sway.toFixed(1) : '--'} mm</span>
                    </div>
                    <div className="site-preview-info-row" style={{ marginBottom: '0' }}>
                        <span className="site-preview-label"><Droplet size={10} style={{ marginRight: '4px' }} /> Total Tilt</span>
                        <span className="site-preview-value font-mono" style={{ fontSize: '0.7rem' }}>{latest ? latest.total_tilt.toFixed(4) : '--'}°</span>
                    </div>

                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Alerts & Notifications</div>
                        <div style={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            background: alertBg,
                            border: `1px solid ${alertBorder}`,
                            borderRadius: '8px',
                            padding: '0.75rem',
                            gap: '0.75rem'
                        }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '30px',
                                height: '30px',
                                borderRadius: '6px',
                                color: alertColor,
                                background: 'rgba(0,0,0,0.2)',
                                border: `1px solid ${alertBorder}`
                            }}>
                                {isTolerance ? <ShieldCheck size={16} /> : <AlertTriangle size={16} className="pulsing-icon" />}
                            </div>
                            <div className="flex-col" style={{ gap: '0.1rem', flex: 1 }}>
                                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: alertColor, letterSpacing: '0.05em' }}>
                                    {towerStatus}
                                </div>
                                <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
                                    {latest ? recommendation : 'Waiting for live data...'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <button onClick={handleOpenDashboard} className="site-preview-btn">
                <ExternalLink size={14} />
                Open Dashboard
            </button>
        </div>
    );
}
