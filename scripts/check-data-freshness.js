#!/usr/bin/env node
'use strict';

// Checks that the hand-maintained data in src/app/manual-data.json is still current:
//  - every entry is for the latest budget year loaded in BudgetKey (or newer)
//  - every tax code used by the tax game still exists, with a planned amount, in that year
// Prints a markdown report and exits with 1 if anything needs updating.
// Requires Node 18+ (global fetch).

const path = require('path');

const API_URL = 'https://next.obudget.org/api/query?query=';
const DEFICIT_FUNDING = 'הכנסות למימון גירעון';
// Keep in sync with src/app/fetching.service.ts
const MIN_YEAR_INCOME = 100000000000;

const manualData = require(path.resolve(__dirname, '../src/app/manual-data.json'));

async function query(sql) {
  const resp = await fetch(API_URL + encodeURIComponent(sql));
  if (!resp.ok) {
    throw new Error(`API returned ${resp.status} for query: ${sql}`);
  }
  const data = await resp.json();
  return data.rows || [];
}

async function main() {
  const yearRows = await query(`
    SELECT year FROM budget
    WHERE code LIKE '0000%%' AND length(code) = 6
      AND coalesce(func_cls_title_2->>0, '') != '${DEFICIT_FUNDING}'
    GROUP BY 1
    HAVING sum(net_allocated) > ${MIN_YEAR_INCOME}
    ORDER BY 1 DESC
    LIMIT 1
  `);
  if (!yearRows.length) {
    throw new Error('Could not find any loaded budget year in the API');
  }
  const year = yearRows[0].year;
  const problems = [];

  const entries = [];
  for (const key of Object.keys(manualData.taxRates)) {
    entries.push([`taxRates.${key}`, manualData.taxRates[key]]);
  }
  for (const key of ['incomeTaxBrackets', 'industryData', 'mapData']) {
    entries.push([key, manualData[key]]);
  }
  for (const [name, entry] of entries) {
    if (!entry.year || entry.year < year) {
      problems.push(`- \`${name}\` is for ${entry.year}, the site shows ${year}. Source: ${entry.source}`);
    }
  }

  const codes = Object.keys(manualData.taxRates).map((key) => manualData.taxRates[key].code);
  const codeRows = await query(`
    SELECT code, title, net_allocated FROM budget
    WHERE year = ${year} AND code IN ('${codes.join("','")}')
  `);
  for (const key of Object.keys(manualData.taxRates)) {
    const code = manualData.taxRates[key].code;
    const row = codeRows.find((r) => r.code === code);
    if (!row) {
      problems.push(`- \`taxRates.${key}\`: budget code ${code} does not exist in ${year} - the tax game will show 0 for it`);
    } else if (!row.net_allocated) {
      problems.push(`- \`taxRates.${key}\`: budget code ${code} (${row.title}) has no planned income in ${year}`);
    }
  }

  console.log(`Latest budget year in BudgetKey: ${year}\n`);
  if (problems.length) {
    console.log(`The following data in \`src/app/manual-data.json\` needs updating:\n`);
    console.log(problems.join('\n'));
    console.log(`\nSee "Keeping the data up to date" in README.md.`);
    process.exit(1);
  }
  console.log('All manual data is up to date.');
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
