'use client';

import { useState, useEffect, useRef } from 'react';
import { ReportResult } from '@/lib/reporting/types';
import { Organization } from '@/lib/reporting/types';
import MetricCards from './MetricCards';
import DailyTable from './DailyTable';

const METRIC_GROUPS = [
  {
    label: 'Tienda',
    metrics: ['revenue', 'orders', 'fees', 'average_order_value'],
  },
  {
    label: 'Meta Ads',
    metrics: ['meta_spend', 'meta_impressions', 'meta_cpm'],
  },
  {
    label: 'Google Ads',
    metrics: ['google_spend', 'google_impressions', 'google_cpm'],
  },
  {
    label: 'Combinadas',
    metrics: ['total_spend', 'profit', 'roas'],
  },
];

interface Props {
  initialData: ReportResult;
  organizations: Organization[];
  defaultOrgId: number;
  defaultStartDate: string;
  defaultEndDate: string;
  defaultMetrics: string[];
}

export default function ReportingDashboard({
  initialData,
  organizations,
  defaultOrgId,
  defaultStartDate,
  defaultEndDate,
  defaultMetrics,
}: Props) {
  const [orgId, setOrgId] = useState(defaultOrgId);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [metrics, setMetrics] = useState<string[]>(defaultMetrics);
  const [data, setData] = useState<ReportResult>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (metrics.length === 0 || !startDate || !endDate) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          orgId: String(orgId),
          startDate,
          endDate,
          metrics: metrics.join(','),
        });
        const res = await fetch(`/api/reporting?${params}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Error al cargar datos');
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orgId, startDate, endDate, metrics]);

  function toggleMetric(metric: string) {
    setMetrics((prev) =>
      prev.includes(metric) ? prev.filter((m) => m !== metric) : [...prev, metric]
    );
  }

  return (
    <div className="space-y-6">

      <div className="border rounded-lg p-4 space-y-4">

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Organización</label>
            <select
              value={orgId}
              onChange={(e) => setOrgId(Number(e.target.value))}
              className="border rounded px-3 py-1.5 text-sm bg-background"
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Fecha inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm bg-background"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">Fecha fin</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border rounded px-3 py-1.5 text-sm bg-background"
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Métricas</p>
          <div className="flex flex-wrap gap-6">
            {METRIC_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.metrics.map((metric) => (
                    <label
                      key={metric}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={metrics.includes(metric)}
                        onChange={() => toggleMetric(metric)}
                      />
                      {metric}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-500 border border-red-200 rounded px-3 py-2">
          {error}
        </div>
      )}

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">Cargando datos...</p>
      )}

      {metrics.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Seleccioná al menos una métrica para ver datos.
        </p>
      )}

      {!loading && metrics.length > 0 && (
        <MetricCards totals={data.totals} metrics={metrics} />
      )}

      {!loading && metrics.length > 0 && data.daily.length > 0 && (
        <DailyTable daily={data.daily} metrics={metrics} />
      )}

      {!loading && metrics.length > 0 && data.daily.length === 0 && (
        <p className="text-sm text-muted-foreground">
          Sin datos para el rango de fechas seleccionado.
        </p>
      )}
    </div>
  );
}
