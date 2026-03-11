'use client';
import {
    Activity,
    ShieldCheck,
    Settings2,
    Cpu,
    Wifi,
    Database,
    Wind,
    Compass,
    ArrowRightLeft,
    AlertTriangle,
    Droplet
} from 'lucide-react';
import { SensorData } from '@/hooks/useSensorData';

interface TelemetrySectionProps {
    latest: SensorData | null;
    isConnected: boolean;
}

export default function TelemetrySection({ latest, isConnected }: TelemetrySectionProps) {
    const windSpeed = latest?.wind_speed ?? 0;
    const pitch = latest?.pitch ?? 0;
    const roll = latest?.roll ?? 0;
    const tiltRate = latest?.tilt_rate ?? 0;
    const sway = latest?.sway ?? 0;
    const totalTilt = latest?.total_tilt ?? 0;

    const maxWind = 19.44;
    const windPercent = Math.min((windSpeed / maxWind) * 100, 100);

    const hasPitch = latest !== null && pitch !== 0;
    const hasRoll = latest !== null && roll !== 0;

    // Determine system status based on thresholds
    const swayWarning = sway > 30;
    const swayCritical = sway > 50;
    const tiltWarning = totalTilt > 0.05;
    const windWarning = windSpeed > 10;
    const pitchWarning = Math.abs(pitch) > 2;
    const rollWarning = Math.abs(roll) > 2;

    const warningCount = (swayWarning ? 1 : 0) + (tiltWarning ? 1 : 0) + (windWarning ? 1 : 0) + (pitchWarning ? 1 : 0) + (rollWarning ? 1 : 0);
    const criticalCount = swayCritical ? 1 : 0;

    let towerStatus = 'TOLERANCE';
    let statusColor = 'var(--accent-green)';
    let statusBg = 'rgba(8, 184, 124, 0.1)';
    let statusBorder = 'rgba(8, 184, 124, 0.4)';
    let recommendation = 'System structural integrity is optimal.';

    if (criticalCount > 0) {
        towerStatus = 'CRITICAL';
        statusColor = 'var(--accent-red)';
        statusBg = 'rgba(244, 63, 94, 0.15)';
        statusBorder = 'rgba(244, 63, 94, 0.6)';
        recommendation = 'Critical threshold exceeded. Immediate inspection advised.';
    } else if (warningCount > 0) {
        towerStatus = 'WARNING';
        statusColor = 'var(--accent-yellow)';
        statusBg = 'rgba(234, 179, 8, 0.15)';
        statusBorder = 'rgba(234, 179, 8, 0.6)';
        recommendation = 'Sub-optimal readings detected. Monitor closely.';
    }

    const systemStatus = criticalCount > 0 ? 'Critical' : warningCount > 0 ? 'Warning' : 'All Clear';
    const statusDot = criticalCount > 0 ? 'red' : warningCount > 0 ? 'yellow' : 'green';

    const activeSensors = latest ? 7 : 0;

    return (
        <div className="flex-col gap-3">

            {/* Real-Time Telemetry Header */}
            <div className="section-header">
                <div className="section-title-wrap">
                    <div className="section-icon bg-teal-subtle">
                        <Activity size={16} />
                    </div>
                    <div className="flex-col" style={{ gap: 0 }}>
                        <h3 className="section-title">Real-Time Telemetry</h3>
                        <p className="section-subtitle">Live sensor readings · auto-refresh every 5s</p>
                    </div>
                </div>
                <div className="badge" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className={`status-dot ${isConnected ? 'teal' : 'red'}`}></div>
                    <span className="text-secondary" style={{ fontSize: '0.65rem' }}>
                        {isConnected ? `${activeSensors} sensors active` : 'Disconnected'}
                    </span>
                </div>
            </div>

            {/* System Status Bar */}
            <div className="system-status-bar justify-between">
                <div className="flex items-center gap-4">
                    <div className="status-main">
                        <div className="shield-icon">
                            <ShieldCheck size={20} />
                        </div>
                        <div className="flex-col" style={{ gap: '0.1rem' }}>
                            <div className="text-tertiary" style={{ fontSize: '0.6rem', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>System Status</div>
                            <div className="font-extrabold flex items-center gap-3 text-primary text-sm">
                                <div className={`status-dot ${statusDot}`}></div> {systemStatus}
                            </div>
                        </div>
                    </div>

                    <div className="status-tags">
                        <div className="status-tag"><Settings2 size={10} /> {warningCount === 0 ? 'Parameters in Range' : `${warningCount} Parameter Warning`}</div>
                        <div className="status-tag"><Cpu size={10} /> Sensors Operational</div>
                        <div className="status-tag"><Wifi size={10} /> {isConnected ? 'Network Stable' : 'Network Down'}</div>
                        <div className="status-tag"><Database size={10} /> {isConnected ? 'Data Pipeline Active' : 'Pipeline Inactive'}</div>
                    </div>
                </div>

                <div className="status-summary flex-col" style={{ gap: '0.1rem' }}>
                    <div className="status-summ-title">{warningCount + criticalCount === 0 ? 'No active alerts' : 'Active alerts detected'}</div>
                    <div className="status-summ-val"><span className="text-primary font-bold">{warningCount}</span> warnings · <span className="text-primary font-bold">{criticalCount}</span> critical</div>
                </div>
            </div>

            {/* Sensor Grid */}
            <div className="sensor-grid">

                {/* Main Sensor: Wind Speed */}
                <div className="sensor-card-main" style={{ gridRow: 'span 2', display: 'flex', flexDirection: 'column' }}>
                    <div className="sensor-header" style={{ alignItems: 'center' }}>
                        <div className="sensor-icon bg-teal-subtle text-teal">
                            <Wind size={20} />
                        </div>
                        <div className="badge" style={{ background: 'transparent', border: '1px solid var(--accent-teal)', color: 'var(--accent-teal)' }}>
                            Wind Speed
                        </div>
                    </div>

                    <div className="flex-col flex-1" style={{ marginTop: '2.5rem', justifyContent: 'center' }}>
                        <div className="sensor-label">CURRENT READING</div>
                        <div className="sensor-value-main">
                            {windSpeed.toFixed(2)} <span className="sensor-unit">knot</span>
                        </div>
                        <div className="sensor-range">Max range: {maxWind} knot</div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
                        <div className="progress-labels">
                            <span>0 knot</span>
                            <span>{maxWind} knot</span>
                        </div>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${windPercent}%` }}></div>
                        </div>
                        <div className="flex items-center gap-2 font-bold" style={{ fontSize: '0.65rem', marginTop: '0.75rem', color: windSpeed > 10 ? 'var(--accent-red)' : 'var(--accent-teal)' }}>
                            <div className={`status-dot ${windSpeed > 10 ? 'red' : 'teal'}`}></div>
                            {windSpeed > 10 ? 'Above safe threshold' : 'Within safe threshold'}
                        </div>
                    </div>
                </div>

                {/* Pitch */}
                <div className="sensor-card" style={{ borderColor: 'rgba(250, 204, 21, 0.4)', gridColumn: '2', gridRow: '1', justifyContent: 'center' }}>
                    <div className="flex items-center gap-4 w-full">
                        <div className="sensor-icon" style={{ color: '#facc15', background: 'rgba(250, 204, 21, 0.1)' }}>
                            <Compass size={18} />
                        </div>
                        <div className="flex-col" style={{ gap: '0.2rem' }}>
                            <div className="sensor-label" style={{ color: 'var(--text-secondary)' }}>PITCH</div>
                            {hasPitch ? (
                                <div className="font-mono text-primary flex items-center gap-2" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                                    {pitch.toFixed(3)}°
                                </div>
                            ) : (
                                <div className="text-tertiary font-mono flex items-center gap-2" style={{ fontSize: '0.75rem' }}>
                                    <div style={{ width: '8px', height: '2px', backgroundColor: 'var(--text-tertiary)' }}></div> No signal
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Roll */}
                <div className="sensor-card" style={{ borderColor: 'rgba(249, 115, 22, 0.4)', gridColumn: '2', gridRow: '2', justifyContent: 'center' }}>
                    <div className="flex items-center gap-4 w-full">
                        <div className="sensor-icon" style={{ color: '#f97316', backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
                            <Activity size={18} />
                        </div>
                        <div className="flex-col" style={{ gap: '0.2rem' }}>
                            <div className="sensor-label" style={{ color: 'var(--text-secondary)' }}>ROLL</div>
                            {hasRoll ? (
                                <div className="font-mono text-primary flex items-center gap-2" style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                                    {roll.toFixed(3)}°
                                </div>
                            ) : (
                                <div className="text-tertiary font-mono flex items-center gap-2" style={{ fontSize: '0.75rem' }}>
                                    <div style={{ width: '8px', height: '2px', backgroundColor: 'var(--text-tertiary)' }}></div> No signal
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tower Health Assessment */}
                <div className="sensor-card" style={{ borderColor: statusBorder, gridColumn: '4', gridRow: 'span 2', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                    <div className="sensor-header" style={{ marginBottom: '0.5rem', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="sensor-icon" style={{ color: statusColor, background: statusBg, borderColor: statusBorder, borderWidth: '1px', borderStyle: 'solid' }}>
                            {towerStatus === 'CRITICAL' ? <AlertTriangle size={20} className="pulsing-icon" /> : towerStatus === 'WARNING' ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                        </div>
                        <div className="sensor-label" style={{ color: 'var(--text-secondary)', marginBottom: 0, fontWeight: 700 }}>Alert & Notifications</div>
                    </div>

                    {/* Glowing background effect */}
                    <div style={{
                        position: 'absolute', top: '-10%', right: '-10%', width: '150%', height: '150%',
                        background: `radial-gradient(circle at top right, ${statusBg} 0%, transparent 60%)`,
                        opacity: 0.8, pointerEvents: 'none', zIndex: 0
                    }} />

                    <div className="flex-col flex-1" style={{ zIndex: 1, justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center', margin: '0.25rem 0 1rem 0' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: statusColor, letterSpacing: '0.05em', textShadow: `0 0 15px ${statusColor}` }}>
                                {towerStatus}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: '0.25rem', padding: '0 0.5rem', lineHeight: 1.4 }}>
                                {recommendation}
                            </div>
                        </div>

                        <div className="flex-col" style={{ gap: '0.5rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.55rem', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: '0.25rem', letterSpacing: '0.05em', fontWeight: 600 }}>Parameter Check</div>

                            <div className="flex justify-between items-center" style={{ fontSize: '0.7rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Wind Speed</span>
                                <div className={`status-dot ${windWarning ? 'yellow' : 'green'}`}></div>
                            </div>
                            <div className="flex justify-between items-center" style={{ fontSize: '0.7rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Pitch</span>
                                <div className={`status-dot ${pitchWarning ? 'yellow' : 'green'}`}></div>
                            </div>
                            <div className="flex justify-between items-center" style={{ fontSize: '0.7rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Roll</span>
                                <div className={`status-dot ${rollWarning ? 'yellow' : 'green'}`}></div>
                            </div>
                            <div className="flex justify-between items-center" style={{ fontSize: '0.7rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Sway</span>
                                <div className={`status-dot ${swayCritical ? 'red' : swayWarning ? 'yellow' : 'green'}`}></div>
                            </div>
                            <div className="flex justify-between items-center" style={{ fontSize: '0.7rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Total Tilt</span>
                                <div className={`status-dot ${tiltWarning ? 'yellow' : 'green'}`}></div>
                            </div>
                        </div>
                    </div>

                    <div style={{ marginTop: 'auto', paddingTop: '1rem', width: '100%', zIndex: 1 }}>
                        <div className="flex items-center justify-between" style={{ padding: '0.5rem', background: statusBg, borderRadius: '6px', border: `1px solid ${statusBorder}` }}>
                            <div className="flex items-center gap-2 font-bold" style={{ fontSize: '0.65rem', color: statusColor }}>
                                <Activity size={12} className={towerStatus !== 'TOLERANCE' ? "pulsing-icon" : ""} />
                                Live Assessment
                            </div>
                            <div style={{ fontSize: '0.65rem', color: statusColor, fontWeight: 600 }}>
                                {latest ? 'Monitoring Active' : 'Waiting...'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sway */}
                <div className="sensor-card" style={{ borderColor: swayCritical ? 'rgba(244, 63, 94, 0.6)' : 'rgba(14, 165, 233, 0.4)', gridColumn: '3', gridRow: '1' }}>
                    <div className="flex justify-between items-start w-full h-full">
                        <div className="flex items-center gap-4">
                            <div className="sensor-icon" style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.15)' }}>
                                <ArrowRightLeft size={20} />
                            </div>
                            <div className="flex-col" style={{ gap: '0.2rem' }}>
                                <div className="sensor-label">SWAY</div>
                                <div className="sensor-value-small">
                                    {sway.toFixed(0)} <span className="sensor-unit-small">mm</span>
                                </div>
                            </div>
                        </div>
                        <div className="tolerance-badge" style={{ color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.2)' }}>
                            <span className="tolerance-label">Toleransi</span>
                            <span className="tolerance-val">30 mm</span>
                        </div>
                    </div>
                    <div className="card-footer-text">Standar: 18 mm</div>
                </div>

                {/* Total Tilt */}
                <div className="sensor-card" style={{ borderColor: tiltWarning ? 'rgba(244, 63, 94, 0.6)' : 'rgba(244, 63, 94, 0.4)', gridColumn: '3', gridRow: '2' }}>
                    <div className="flex justify-between items-start w-full h-full">
                        <div className="flex items-center gap-4">
                            <div className="sensor-icon" style={{ color: 'var(--accent-red)', background: 'rgba(244, 63, 94, 0.15)' }}>
                                <Droplet size={20} />
                            </div>
                            <div className="flex-col" style={{ gap: '0.2rem' }}>
                                <div className="sensor-label">TOTAL TILT</div>
                                <div className="sensor-value-small" style={{ fontWeight: 800 }}>
                                    {totalTilt.toFixed(4)}<span className="sensor-unit-small" style={{ marginLeft: '2px' }}>°</span>
                                </div>
                            </div>
                        </div>
                        <div className="tolerance-badge" style={{ color: 'var(--accent-red)', borderColor: 'rgba(244, 63, 94, 0.2)' }}>
                            <span className="tolerance-label">Toleransi</span>
                            <span className="tolerance-val">0.05°</span>
                        </div>
                    </div>
                    <div className="card-footer-text">Range: 0° - 90°</div>
                </div>

            </div>
        </div>
    );
}
