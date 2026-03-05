import { getReport, getOrganizations } from '@/lib/reporting';
import ReportingDashboard from './components/ReportingDashboard';

const DEFAULT_ORG_ID = 1;
const DEFAULT_METRICS = ['revenue', 'meta_spend', 'google_spend', 'profit', 'roas'];

function getDefaultDates() {
  const today = new Date();
  const end = new Date(today);
  end.setDate(today.getDate() - 1); 
  const start = new Date(today);
  start.setDate(today.getDate() - 30);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
  };
}

export default async function Home() {
  const { startDate, endDate } = getDefaultDates();

  const [initialData, organizations] = await Promise.all([
    getReport({ orgId: DEFAULT_ORG_ID, startDate, endDate, metrics: DEFAULT_METRICS }),
    getOrganizations(),
  ]);

  return (
    <main className="min-h-screen p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Reporting Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Multi-canal — Meta Ads · Google Ads · Tienda
        </p>
      </div>

      <ReportingDashboard
        initialData={initialData}
        organizations={organizations}
        defaultOrgId={DEFAULT_ORG_ID}
        defaultStartDate={startDate}
        defaultEndDate={endDate}
        defaultMetrics={DEFAULT_METRICS}
      />
    </main>
  );
}
