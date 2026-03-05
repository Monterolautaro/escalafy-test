export function formatValue(metric: string, value: number): string {
  if (metric === 'roas') {
    return `${value.toFixed(2)}x`;
  }
  if (metric === 'orders' || metric === 'meta_impressions' || metric === 'google_impressions') {
    return value.toLocaleString('en-US');
  }
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
