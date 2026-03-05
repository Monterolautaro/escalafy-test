import { DailyRow } from '@/lib/reporting/types';
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
  daily: DailyRow[];
  metrics: string[];
}

export default function DailyTable({ daily, metrics }: Props) {
  return (
    <div className="overflow-x-auto border rounded-lg">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="py-2 px-4 text-left font-medium text-muted-foreground whitespace-nowrap">
              Fecha
            </th>
            {metrics.map((metric) => (
              <th
                key={metric}
                className="py-2 px-4 text-right font-medium text-muted-foreground whitespace-nowrap"
              >
                {METRIC_LABELS[metric] ?? metric}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {daily.map((row) => (
            <tr key={row.date} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
              <td className="py-2 px-4 whitespace-nowrap">{row.date}</td>
              {metrics.map((metric) => {
                const value = row[metric as keyof DailyRow];
                return (
                  <td key={metric} className="py-2 px-4 text-right tabular-nums whitespace-nowrap">
                    {value !== undefined ? formatValue(metric, Number(value)) : '—'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
