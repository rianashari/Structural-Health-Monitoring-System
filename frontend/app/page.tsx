'use client';
import Header from '@/components/layout/Header';
import HeroCard from '@/components/ui/HeroCard';
import TelemetrySection from '@/components/ui/TelemetrySection';
import TrendAnalysis from '@/components/ui/TrendAnalysis';
import HistoryTable from '@/components/ui/HistoryTable';
import { useSensorData } from '@/hooks/useSensorData';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { isAuthenticated, logout } = useAuth();
  const { latest, history, isConnected } = useSensorData(5000);

  // Show nothing while checking auth
  if (isAuthenticated === null) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#060912',
      }}>
        <div style={{
          width: '40px', height: '40px',
          border: '3px solid rgba(99, 102, 241, 0.2)',
          borderTop: '3px solid #6366f1',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="dashboard-container">
      <Header latest={latest} history={history} onLogout={logout} />
      <HeroCard latest={latest} isConnected={isConnected} />
      <TelemetrySection latest={latest} isConnected={isConnected} />
      <TrendAnalysis history={history} />
      <HistoryTable history={history} />
    </div>
  );
}
