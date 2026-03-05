import { RawRow, AllMetrics } from './types';

export function computeRowMetrics(row: RawRow): AllMetrics {
    const total_spend = row.meta_spend + row.google_spend;

    return {
        meta_spend: row.meta_spend,
        meta_impressions: row.meta_impressions,
        google_spend: row.google_spend,
        google_impressions: row.google_impressions,
        revenue: row.revenue,
        orders: row.orders,
        fees: row.fees,

        meta_cpm: row.meta_impressions > 0 
            ? (row.meta_spend / row.meta_impressions) * 1000
            : 0,

        google_cpm: row.google_impressions > 0 
            ? (row.google_spend / row.google_impressions) * 1000
            : 0,

        average_order_value: row.orders > 0 
            ? row.revenue / row.orders 
            : 0,

        total_spend,

        profit: row.revenue - total_spend - row.fees,

        roas:
            total_spend > 0
                ? row.revenue / total_spend
                : 0,
    };
}
