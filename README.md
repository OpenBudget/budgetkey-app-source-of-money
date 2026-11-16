# Source of Money

## What is this?

This project is part of [BudgetKey](https://github.com/OpenBudget/BudgetKey), the Israeli open budget project.
It aims to support public discussion in the area of taxes and other governmental sources of income.
It does so by providing an easy-to-use but informative website to view and play with income data.
The link to the website is [next.obudget.org/income](next.obudget.org/income).

## First time

Run `npm install` to install all npm packeges needed for the project.
Then run `npm run build` to build the project.
Then finally run `npm run start` to run the project and navigate to `localhost:8000` to view it.

## Keeping the data up to date

Most of the site updates itself: the year shown, the income categories, the total income and the tax game's
amounts are all fetched from the BudgetKey API, for the latest budget year that has its income loaded
(see `getYear()` in `src/app/fetching.service.ts`).

What can't be fetched lives in `src/app/manual-data.json`, each entry with the year it is correct for and its source:

| Entry | What | Shown in |
|---|---|---|
| `taxRates` | Current rate of each tax in the tax game, and its budget code | Tax game |
| `incomeTaxBrackets` | Monthly income tax brackets (the last one is the surtax) | "Direct vs. indirect taxes" chart |
| `industryData` | Year of `src/app/industryData.json` (tax income by industry) | "Taxes by industry" |
| `mapData` | Year of `src/app/mapData.json` (income tax from employees by municipality) | Map |

Run `npm run check-data` to see what is out of date. The
[Data freshness](.github/workflows/data-freshness.yml) workflow runs the same check on the 1st of every month and
opens a "Data needs updating" issue when something is stale. To fix it, update the value **and its `year`** in
`manual-data.json` (and replace the JSON data file, for `industryData` / `mapData`).

## Contributing

This project has a [Notion page](https://fascinated-pastry-ca1.notion.site/11b7d47cb9464684bd1d28cdd64678e5).

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module` to generate other project parts.


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.1.3.
