'use client';
import { FileDown } from 'lucide-react';
import { SensorData } from '@/hooks/useSensorData';
import { generateReport } from '@/utils/generateReport';

interface HeaderProps {
    latest?: SensorData | null;
    history?: SensorData[];
}

export default function Header({ latest = null, history = [] }: HeaderProps) {
    const handleDownload = () => {
        generateReport(latest, history);
    };

    return (
        <header style={{ paddingBottom: '0.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 className="top-header">Structural Health Monitoring System</h1>
            <button
                onClick={handleDownload}
                className="report-btn"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(139, 92, 246, 0.15))',
                    border: '1px solid rgba(14, 165, 233, 0.3)',
                    borderRadius: '8px',
                    color: '#38bdf8',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(14, 165, 233, 0.25), rgba(139, 92, 246, 0.25))';
                    e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.15)';
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(139, 92, 246, 0.15))';
                    e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.3)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                <FileDown size={16} />
                Download Report
            </button>
        </header>
    );
}
