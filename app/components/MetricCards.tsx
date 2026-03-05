import { MetricRecord } from '@/lib/reporting/types';
import { formatValue } from './format';

const METRIC_LABELS: Record<string, string> = {
  revenue: 'Revenue',
  orders: 'Orders',
  fees: 'Fees',
  average_order_value: 'Avg. Order Value',
  meta_spend: 'Meta Spend',
  meta_impressions: 'Meta Impressions',
  meta_cpm: 'Meta CPM',
  google_spend: 'Google Spend',
  google_impressions: 'Google Impressions',
  google_cpm: 'Google CPM',
  total_spend: 'Total Spend',
  profit: 'Profit',
  roas: 'ROAS',
};

interface Props {
  totals: MetricRecord;
  metrics: string[];
}

export default function MetricCards({ totals, metrics }: Props) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {metrics.map((metric) => {
        const value = totals[metric as keyof MetricRecord];
        if (value === undefined) return null;
        return (
          <div key={metric} className="border rounded-lg p-4 space-y-1">
            <p className="text-xs text-muted-foreground">{METRIC_LABELS[metric] ?? metric}</p>
            <p className="text-lg font-semibold tabular-nums">
              {formatValue(metric, Number(value))}
            </p>
          </div>
        );
      })}
    </div>
  );
}
