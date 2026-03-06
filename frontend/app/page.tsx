'use client';
import Header from '@/components/layout/Header';
import HeroCard from '@/components/ui/HeroCard';
import TelemetrySection from '@/components/ui/TelemetrySection';
import TrendAnalysis from '@/components/ui/TrendAnalysis';
import HistoryTable from '@/components/ui/HistoryTable';
import LoginPage from '@/components/ui/LoginPage';
import { useSensorData } from '@/hooks/useSensorData';
import { useAuth } from '@/hooks/useAuth';

export default function Dashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const { latest, history, isConnected } = useSensorData(isAuthenticated ? 5000 : 0);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="dashboard-container">
      <Header latest={latest} history={history} />
      <HeroCard latest={latest} isConnected={isConnected} />
      <TelemetrySection latest={latest} isConnected={isConnected} />
      <TrendAnalysis history={history} />
      <HistoryTable history={history} />
    </div>
  );
}
