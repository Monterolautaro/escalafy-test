import pool from '../db';
import { RawRow, Organization } from './types';

export async function getOrganization(orgId: number): Promise<Organization> {
  const result = await pool.query<Organization>(
    `SELECT id, name, meta_account_id, google_account_id, store_id
     FROM organization
     WHERE id = $1`,
    [orgId]
  );

  if (result.rows.length === 0) {
    throw new Error(`Organización con id ${orgId} no encontrada`);
  }

  return result.rows[0];
}

export async function getOrganizations(): Promise<Organization[]> {
  const result = await pool.query<Organization>(
    `SELECT id, name, meta_account_id, google_account_id, store_id
     FROM organization
     ORDER BY id ASC`
  );
  return result.rows;
}

export async function fetchRawRows(
  org: Organization,
  startDate: string,
  endDate: string
): Promise<RawRow[]> {
  const sql = `
    WITH meta AS (
      SELECT
        date,
        SUM(spend)       AS meta_spend,
        SUM(impressions) AS meta_impressions
      FROM meta_ads_data
      WHERE account_id = $1
        AND date BETWEEN $3 AND $4
      GROUP BY date
    ),
    google AS (
      SELECT
        date,
        SUM(spend)       AS google_spend,
        SUM(impressions) AS google_impressions
      FROM google_ads_data
      WHERE account_id = $2
        AND date BETWEEN $3 AND $4
      GROUP BY date
    ),
    store AS (
      SELECT
        date,
        SUM(revenue) AS revenue,
        SUM(orders)  AS orders,
        SUM(fees)    AS fees
      FROM store_data
      WHERE store_id = $5
        AND date BETWEEN $3 AND $4
      GROUP BY date
    ),
    days AS (
      SELECT
        COALESCE(m.date, g.date, s.date)   AS date,
        COALESCE(m.meta_spend, 0)          AS meta_spend,
        COALESCE(m.meta_impressions, 0)    AS meta_impressions,
        COALESCE(g.google_spend, 0)        AS google_spend,
        COALESCE(g.google_impressions, 0)  AS google_impressions,
        COALESCE(s.revenue, 0)             AS revenue,
        COALESCE(s.orders, 0)              AS orders,
        COALESCE(s.fees, 0)                AS fees
      FROM meta m
      FULL OUTER JOIN google g USING (date)
      FULL OUTER JOIN store  s USING (date)
    )
    SELECT * FROM days ORDER BY date ASC
  `;

  const result = await pool.query<RawRow>(sql, [
    org.meta_account_id,    
    org.google_account_id, 
    startDate,             
    endDate,               
    org.store_id,           
  ]);

  return result.rows.map((row) => ({
    date: new Date(row.date).toISOString().slice(0, 10),
    meta_spend: Number(row.meta_spend),
    meta_impressions: Number(row.meta_impressions),
    google_spend: Number(row.google_spend),
    google_impressions: Number(row.google_impressions),
    revenue: Number(row.revenue),
    orders: Number(row.orders),
    fees: Number(row.fees),
  }));
}
