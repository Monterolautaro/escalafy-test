
export interface ReportParams {
    orgId: number;
    startDate: string; 
    endDate: string; 
    metrics: string[];
}

export interface RawRow {
    date: string;
    meta_spend: number;
    meta_impressions: number;
    google_spend: number;
    google_impressions: number;
    revenue: number;
    orders: number;
    fees: number;
}

export interface AllMetrics {
    meta_spend: number;
    meta_impressions: number;
    google_spend: number;
    google_impressions: number;
    revenue: number;
    orders: number;
    fees: number;
    meta_cpm: number;
    google_cpm: number;
    average_order_value: number;
    total_spend: number;
    profit: number;
    roas: number;
}

export type MetricRecord = Partial<AllMetrics>;

export interface DailyRow extends MetricRecord {
    date: string;
}

export interface ReportResult {
    totals: MetricRecord;
    daily: DailyRow[];
}

export interface Organization {
    id: number;
    name: string;
    meta_account_id: string;
    google_account_id: string;
    store_id: string;
}
