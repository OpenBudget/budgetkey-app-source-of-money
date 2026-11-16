import { Injectable } from '@angular/core';
import * as manualDataJson from './manual-data.json';

const API_URL = 'https://next.obudget.org/api/query?query=';

export const DEFICIT_FUNDING = 'הכנסות למימון גירעון';

// A budget year counts as loaded once its planned income (excluding deficit funding) passes this amount -
// partially loaded years (e.g. a proposal with only a few rows) are skipped.
const MIN_YEAR_INCOME = 100000000000;

export const MANUAL_DATA: any = (manualDataJson as any).default || manualDataJson;

@Injectable({
  providedIn: 'root'
})
export class FetchingService {
  private yearPromise: Promise<number> = null;
  private taxesPromise: Promise<any> = null;

  async query(sql: string): Promise<any[]> {
    const raw = await fetch(API_URL + encodeURIComponent(sql));
    const data = await raw.json();
    return data.rows || [];
  }

  // The latest year for which the state's income budget is loaded
  getYear(): Promise<number> {
    if (!this.yearPromise) {
      this.yearPromise = this.query(`
        SELECT year FROM budget
        WHERE code LIKE '0000%%' AND length(code) = 6
          AND coalesce(func_cls_title_2->>0, '') != '${DEFICIT_FUNDING}'
        GROUP BY 1
        HAVING sum(net_allocated) > ${MIN_YEAR_INCOME}
        ORDER BY 1 DESC
        LIMIT 1
      `).then((rows) => rows.length ? rows[0].year : new Date().getFullYear());
    }
    return this.yearPromise;
  }

  // Income items (6 digit codes) for the latest year
  async getIncomeItems(): Promise<any[]> {
    const year = await this.getYear();
    return this.query(`
      SELECT year, func_cls_title_2->>0 AS func_title, title, code, net_allocated AS allocated
      FROM budget
      WHERE year = ${year} AND code LIKE '0000%%' AND length(code) = 6
      ORDER BY func_title, code
    `);
  }

  // Planned income, excluding deficit funding, for the latest year
  async getTotalIncome(): Promise<number> {
    const year = await this.getYear();
    const rows = await this.query(`
      SELECT sum(net_allocated) AS allocated
      FROM budget
      WHERE year = ${year} AND code LIKE '0000%%' AND length(code) = 6
        AND coalesce(func_cls_title_2->>0, '') != '${DEFICIT_FUNDING}'
    `);
    return rows.length ? rows[0].allocated : 0;
  }

  private fetchTaxes(): Promise<any> {
    if (!this.taxesPromise) {
      this.taxesPromise = this.getYear().then((year) => {
        const codes = Object.keys(MANUAL_DATA.taxRates).map((key) => MANUAL_DATA.taxRates[key].code);
        return this.query(`
          SELECT code, title, year, net_allocated AS amount
          FROM budget
          WHERE year = ${year} AND code IN ('${codes.join("','")}')
        `);
      }).then((rows) => {
        const byCode = {};
        for (const row of rows) {
          byCode[row.code] = row;
        }
        return byCode;
      });
    }
    return this.taxesPromise;
  }

  // A single income item, by its code, for the latest year: {code, title, year, amount}
  async get(code: string) {
    const taxes = await this.fetchTaxes();
    return taxes[code] || { code, title: '', year: await this.getYear(), amount: 0 };
  }

  // Income items for the latest year whose title contains the given text
  async fetchTaxByTitle(title: string) {
    const year = await this.getYear();
    return this.query(`
      SELECT DISTINCT ON (title) code, title, year, net_allocated AS amount
      FROM budget
      WHERE year = ${year} AND code LIKE '0000%%'
        AND strpos(title, '${title.replace(/'/g, "''")}') > 0
        AND coalesce(net_allocated, 0) != 0
      ORDER BY title, length(code)
    `);
  }
}
