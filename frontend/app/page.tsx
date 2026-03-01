import Header from '@/components/layout/Header';
import HeroCard from '@/components/ui/HeroCard';
import TelemetrySection from '@/components/ui/TelemetrySection';
import TrendAnalysis from '@/components/ui/TrendAnalysis';
import HistoryTable from '@/components/ui/HistoryTable';

export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <Header />
      <HeroCard />
      <TelemetrySection />
      <TrendAnalysis />
      <HistoryTable />
    </div>
  );
}
