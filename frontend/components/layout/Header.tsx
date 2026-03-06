'use client';
import { useState } from 'react';
import { FileDown, Loader2, LogOut } from 'lucide-react';
import { SensorData } from '@/hooks/useSensorData';
import { useAuth } from '@/hooks/useAuth';
import { generateReport } from '@/utils/generateReport';
import ExportModal from '../ui/ExportModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api';

interface HeaderProps {
    latest?: SensorData | null;
    history?: SensorData[];
}

export default function Header({ latest = null, history = [] }: HeaderProps) {
    const { logout } = useAuth();
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
                generateReport(reportLatest, filteredData, startDate, endDate);
            } else {
                // Fallback to existing history if API fails
                generateReport(latest, history, startDate, endDate);
            }
        } catch {
            // Fallback to existing history on error
            generateReport(latest, history, startDate, endDate);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <header style={{ paddingBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="top-header">Structural Health Monitoring System</h1>
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

                <button
                    onClick={logout}
                    className="logout-btn"
                    title="Logout"
                >
                    <LogOut size={14} />
                    Logout
                </button>
            </div>

            <ExportModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                onExport={handleExportConfirm}
            />
        </header>
    );
}
