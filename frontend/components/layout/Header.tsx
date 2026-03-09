'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileDown, Loader2, LogOut, ArrowLeft } from 'lucide-react';
import { SensorData } from '@/hooks/useSensorData';
import { generateReport } from '@/utils/generateReport';
import ExportModal from '../ui/ExportModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface HeaderProps {
    latest?: SensorData | null;
    history?: SensorData[];
    onLogout?: () => void;
    siteName?: string;
    deviceId?: string;
}

export default function Header({ latest = null, history = [], onLogout, siteName, deviceId }: HeaderProps) {
    const router = useRouter();
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleDownload = () => {
        setIsExportOpen(true);
    };

    const handleExportConfirm = async (startDate: Date | null, endDate: Date | null) => {
        setIsExportOpen(false);
        setIsExporting(true);

        try {
            // Build query params for date-filtered data from backend
            const params = new URLSearchParams();
            params.set('limit', '5000');

            // Include device_id if available (for per-site reports)
            if (latest?.device_id) {
                params.set('device_id', latest.device_id);
            }

            if (startDate) {
                const y = startDate.getFullYear();
                const m = (startDate.getMonth() + 1).toString().padStart(2, '0');
                const d = startDate.getDate().toString().padStart(2, '0');
                params.set('start_date', `${y}-${m}-${d}`);
            }
            if (endDate) {
                const y = endDate.getFullYear();
                const m = (endDate.getMonth() + 1).toString().padStart(2, '0');
                const d = endDate.getDate().toString().padStart(2, '0');
                params.set('end_date', `${y}-${m}-${d}`);
            }

            const res = await fetch(`${API_BASE}/sensor-data/history/?${params.toString()}`);
            if (res.ok) {
                const filteredData: SensorData[] = await res.json();
                // Use the latest from filtered data if available, otherwise use current latest
                const reportLatest = filteredData.length > 0 ? filteredData[0] : latest;
                generateReport(reportLatest, filteredData, startDate, endDate, { name: siteName, deviceId });
            } else {
                // Fallback to existing history if API fails
                generateReport(latest, history, startDate, endDate, { name: siteName, deviceId });
            }
        } catch {
            // Fallback to existing history on error
            generateReport(latest, history, startDate, endDate, { name: siteName, deviceId });
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <header style={{ paddingBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                <button
                    onClick={() => router.push('/rectifier-site-map')}
                    className="back-to-map-btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.375rem',
                        padding: '0.5rem 0.75rem',
                        background: 'linear-gradient(135deg, rgba(14, 189, 181, 0.12), rgba(99, 102, 241, 0.12))',
                        border: '1px solid rgba(14, 189, 181, 0.25)',
                        borderRadius: '8px',
                        color: '#0ebdb5',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(14, 189, 181, 0.22), rgba(99, 102, 241, 0.22))';
                        e.currentTarget.style.borderColor = 'rgba(14, 189, 181, 0.5)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(14, 189, 181, 0.12), rgba(99, 102, 241, 0.12))';
                        e.currentTarget.style.borderColor = 'rgba(14, 189, 181, 0.25)';
                    }}
                >
                    <ArrowLeft size={14} />
                    Map
                </button>
                {(siteName || deviceId) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', minWidth: 0 }}>
                        {siteName && (
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {siteName}
                            </span>
                        )}
                        {deviceId && (
                            <span style={{ fontSize: '0.6rem', color: 'var(--accent-teal)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.02em' }}>
                                {deviceId}
                            </span>
                        )}
                    </div>
                )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                    onClick={handleDownload}
                    disabled={isExporting}
                    className="report-btn"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: isExporting
                            ? 'rgba(14, 165, 233, 0.1)'
                            : 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(139, 92, 246, 0.15))',
                        border: '1px solid rgba(14, 165, 233, 0.3)',
                        borderRadius: '8px',
                        color: '#38bdf8',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: isExporting ? 'wait' : 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap',
                        opacity: isExporting ? 0.7 : 1,
                    }}
                    onMouseEnter={e => {
                        if (!isExporting) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(139, 92, 246, 0.25))';
                            e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.5)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.15)';
                        }
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = isExporting
                            ? 'rgba(14, 165, 233, 0.1)'
                            : 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(139, 92, 246, 0.15))';
                        e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }}
                >
                    {isExporting ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                    {isExporting ? 'Generating...' : 'Download Report'}
                </button>
                {onLogout && (
                    <button
                        onClick={onLogout}
                        className="report-btn"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.375rem',
                            padding: '0.5rem 0.75rem',
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.25)',
                            borderRadius: '8px',
                            color: '#fb7185',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.4)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(244, 63, 94, 0.25)';
                        }}
                    >
                        <LogOut size={14} />
                        Logout
                    </button>
                )}
            </div>

            <ExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                onExport={handleExportConfirm}
            />
        </header>
    );
}
