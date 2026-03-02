'use client';
import Header from '@/components/layout/Header';
import HeroCard from '@/components/ui/HeroCard';
import TelemetrySection from '@/components/ui/TelemetrySection';
import TrendAnalysis from '@/components/ui/TrendAnalysis';
import HistoryTable from '@/components/ui/HistoryTable';
import { useSensorData } from '@/hooks/useSensorData';

export default function Dashboard() {
  const { latest, history, isConnected } = useSensorData(5000);

  return (
    <div className="dashboard-container">
      <Header />
      <HeroCard latest={latest} isConnected={isConnected} />
      <TelemetrySection latest={latest} isConnected={isConnected} />
      <TrendAnalysis history={history} />
      <HistoryTable history={history} />
    </div>
  );
}
