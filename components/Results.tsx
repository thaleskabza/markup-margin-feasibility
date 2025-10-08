// components/Results.tsx
"use client";
import { Core, Projection, formatCurrency } from "../lib/calculations";

export default function Results({
  core, proj, currency
}: { core: Core; proj: Projection; currency: string; }) {
  return (
    <div className="card space-y-6">
      <h2 className="text-xl font-semibold">Results</h2>
      <div className="grid2">
        <div>
          <h3 className="font-medium mb-2">Unit Economics (excl. VAT unless noted)</h3>
          <ul className="space-y-1 text-sm">
            <li>Cost per unit: <b>{formatCurrency(core.costExcl, currency)}</b></li>
            <li>Price (excl): <b>{formatCurrency(core.priceExcl, currency)}</b></li>
            <li>VAT per unit: <b>{formatCurrency(core.vatAmountPerUnit, currency)}</b></li>
            <li>Price {`(${currency})`} {`incl VAT if selected`}: <b>{formatCurrency(core.priceIncl, currency)}</b></li>
            <li>Markup: <b>{core.markupPct.toFixed(2)}%</b></li>
            <li>Margin: <b>{core.marginPct.toFixed(2)}%</b></li>
            <li>Unit Profit (excl): <b>{formatCurrency(core.unitProfitExcl, currency)}</b></li>
            <li>Breakeven units / month: <b>{core.breakevenUnits ? core.breakevenUnits.toFixed(2) : "N/A (non-viable)"}</b></li>
          </ul>
        </div>
        <div>
          <h3 className="font-medium mb-2">12-Month Totals (excl. VAT)</h3>
          <ul className="space-y-1 text-sm">
            <li>Revenue: <b>{formatCurrency(proj.totals.revenueExcl, currency)}</b></li>
            <li>Variable Cost: <b>{formatCurrency(proj.totals.variableCost, currency)}</b></li>
            <li>Gross Profit: <b>{formatCurrency(proj.totals.grossProfit, currency)}</b></li>
            <li>Fixed Costs: <b>{formatCurrency(proj.totals.fixedCosts, currency)}</b></li>
            <li>Operating Profit: <b>{formatCurrency(proj.totals.operatingProfit, currency)}</b></li>
          </ul>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-800">
              <th className="py-2 pr-4">Month</th>
              <th className="py-2 pr-4">Units</th>
              <th className="py-2 pr-4">Revenue</th>
              <th className="py-2 pr-4">Variable Cost</th>
              <th className="py-2 pr-4">Gross Profit</th>
              <th className="py-2 pr-4">Margin %</th>
              <th className="py-2 pr-4">Fixed Costs</th>
              <th className="py-2 pr-4">Operating Profit</th>
            </tr>
          </thead>
          <tbody>
            {proj.rows.map(r => (
              <tr key={r.month} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-1 pr-4">{r.month}</td>
                <td className="py-1 pr-4">{r.units.toFixed(2)}</td>
                <td className="py-1 pr-4">{formatCurrency(r.revenueExcl, currency)}</td>
                <td className="py-1 pr-4">{formatCurrency(r.variableCost, currency)}</td>
                <td className="py-1 pr-4">{formatCurrency(r.grossProfit, currency)}</td>
                <td className="py-1 pr-4">{r.marginPct.toFixed(2)}%</td>
                <td className="py-1 pr-4">{formatCurrency(r.fixedCosts, currency)}</td>
                <td className="py-1 pr-4">{formatCurrency(r.operatingProfit, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500">
        Notes: Markup = (Price − Cost) / Cost. Margin = (Price − Cost) / Price. VAT is shown separately; best practice is to price off **excl. VAT** costs and let tax flow through.
      </p>
    </div>
  );
}
