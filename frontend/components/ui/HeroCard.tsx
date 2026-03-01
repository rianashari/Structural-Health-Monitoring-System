import { RefreshCw, MapPin, Hash, Ratio, ArrowUp } from 'lucide-react';

export default function HeroCard() {
    return (
        <div className="hero-card">
            <div className="hero-bg"></div>
            <div className="hero-content">

                <div className="hero-badges">
                    <div className="flex gap-2">
                        <span className="badge online" style={{ borderColor: 'var(--accent-green)' }}>
                            <div className="status-dot green"></div> Online
                        </span>
                        <span className="badge">Structural Health Monitoring</span>
                    </div>

                    <span className="badge" style={{ backgroundColor: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <RefreshCw size={12} className="text-teal" />
                        <div className="flex-col" style={{ gap: '0' }}>
                            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.55rem', lineHeight: 1 }}>Last Update</span>
                            <span className="text-teal font-mono" style={{ fontSize: '0.65rem', lineHeight: 1.2 }}>02-03-2026 00:04:05</span>
                        </div>
                    </span>
                </div>

                <div>
                    <h2 className="hero-title">Nayaka WS</h2>
                    <p className="hero-subtitle">Vertically Monitored IoT Asset</p>
                </div>

                <div className="hero-stats-bar">
                    <div className="stat-item">
                        <div className="stat-icon-wrap"><MapPin size={14} /></div>
                        <div className="flex-col" style={{ gap: '0' }}>
                            <span className="stat-label">Site Name</span>
                            <span className="stat-value text-primary">Nayaka WS</span>
                        </div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-icon-wrap"><Hash size={14} /></div>
                        <div className="flex-col" style={{ gap: '0' }}>
                            <span className="stat-label">Tower ID</span>
                            <span className="stat-value text-primary">SDA-07-063</span>
                        </div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-icon-wrap"><Ratio size={14} /></div>
                        <div className="flex-col" style={{ gap: '0' }}>
                            <span className="stat-label">Tower Type</span>
                            <span className="stat-value text-primary">Monopole</span>
                        </div>
                    </div>

                    <div className="stat-item">
                        <div className="stat-icon-wrap"><ArrowUp size={14} /></div>
                        <div className="flex-col" style={{ gap: '0' }}>
                            <span className="stat-label">Tower Height</span>
                            <span className="stat-value text-primary">30 Meter</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
