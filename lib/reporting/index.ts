import { getOrganization, getOrganizations, fetchRawRows } from './query';
import { computeRowMetrics } from './metrics';
import { ReportParams, ReportResult, RawRow, AllMetrics, MetricRecord } from './types';

export { getOrganizations };

export const VALID_METRICS: (keyof AllMetrics)[] = [
    'meta_spend', 'meta_impressions',
    'google_spend', 'google_impressions',
    'revenue', 'orders', 'fees',
    'meta_cpm', 'google_cpm', 'average_order_value',
    'total_spend', 'profit', 'roas',
];

function sumRawRows(rows: RawRow[]): RawRow {
    return rows.reduce(
        (acc, row) => ({
            date: '',
            meta_spend: acc.meta_spend + row.meta_spend,
            meta_impressions: acc.meta_impressions + row.meta_impressions,
            google_spend: acc.google_spend + row.google_spend,
            google_impressions: acc.google_impressions + row.google_impressions,
            revenue: acc.revenue + row.revenue,
            orders: acc.orders + row.orders,
            fees: acc.fees + row.fees,
        }),
        {
            date: '',
            meta_spend: 0, meta_impressions: 0,
            google_spend: 0, google_impressions: 0,
            revenue: 0, orders: 0, fees: 0,
        }
    );
}

function pick(metrics: AllMetrics, keys: string[]): MetricRecord {
    const result: MetricRecord = {};
    for (const key of keys) {
        if (key in metrics) {
            result[key as keyof AllMetrics] = metrics[key as keyof AllMetrics];
        }
    }
    return result;
}

export async function getReport(params: ReportParams): Promise<ReportResult> {
    const org = await getOrganization(params.orgId);
    const rawRows = await fetchRawRows(org, params.startDate, params.endDate);

    const allDaily = rawRows.map((row) => ({
        date: row.date,
        ...computeRowMetrics(row),
    }));

    const summedRaw = sumRawRows(rawRows);
    const allTotals = computeRowMetrics(summedRaw);

    return {
        totals: pick(allTotals, params.metrics),
        daily: allDaily.map((d) => ({
            date: d.date,
            ...pick(d, params.metrics),
        })),
    };
}
