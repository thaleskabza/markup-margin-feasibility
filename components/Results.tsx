"use client";
import { Core, Projection, formatCurrency } from "../lib/calculations";
import Tooltip from "./Tooltip";

function HLabel({ text, tip }: { text: string; tip: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      {text}
      <Tooltip text={tip} />
    </span>
  );
}

export default function Results({
  core, proj, currency
}: { core: Core; proj: Projection; currency: string; }) {
  return (
    <div className="card space-y-6">
      <h2 className="text-xl font-semibold">Results</h2>
      <div className="grid2">
        <div>
          <h3 className="font-medium mb-2">Unit Economics <span className="text-xs text-gray-500">(excl. VAT unless noted)</span></h3>
          <ul className="space-y-1 text-sm">
            <li><HLabel text="Cost per unit" tip="Direct unit cost to produce/fulfil—exclude VAT. Includes materials, direct labour, packaging, etc." />: <b>{formatCurrency(core.costExcl, currency)}</b></li>
            <li><HLabel text="Price (excl.)" tip="Selling price before VAT. Calculated from your chosen markup or margin." />: <b>{formatCurrency(core.priceExcl, currency)}</b></li>
            <li><HLabel text="VAT per unit" tip="VAT added to the selling price (if applicable). Shown for transparency." />: <b>{formatCurrency(core.vatAmountPerUnit, currency)}</b></li>
            <li><HLabel text="Price (incl. VAT)" tip="Displayed price if you choose to include VAT in customer-facing price." />: <b>{formatCurrency(core.priceIncl, currency)}</b></li>
            <li><HLabel text="Markup %" tip="(Price − Cost) ÷ Cost × 100. Markup expresses profit as a % of cost." />: <b>{core.markupPct.toFixed(2)}%</b></li>
            <li><HLabel text="Margin %" tip="(Price − Cost) ÷ Price × 100. Margin expresses profit as a % of selling price." />: <b>{core.marginPct.toFixed(2)}%</b></li>
            <li><HLabel text="Unit Profit (excl.)" tip="Price (excl. VAT) minus Cost (excl. VAT). VAT is a pass-through tax, so keep it out of profit." />: <b>{formatCurrency(core.unitProfitExcl, currency)}</b></li>
            <li><HLabel text="Breakeven units / month" tip="Fixed costs ÷ Unit contribution. Units needed each month to cover overheads." />: <b>{core.breakevenUnits ? core.breakevenUnits.toFixed(2) : "N/A (non-viable)"}</b></li>
          </ul>
        </div>
        <div>
          <h3 className="font-medium mb-2">12-Month Totals <span className="text-xs text-gray-500">(excl. VAT)</span></h3>
          <ul className="space-y-1 text-sm">
            <li><HLabel text="Revenue" tip="Sum of monthly price (excl. VAT) × units sold." />: <b>{formatCurrency(proj.totals.revenueExcl, currency)}</b></li>
            <li><HLabel text="Variable Cost" tip="Sum of monthly unit cost × units sold." />: <b>{formatCurrency(proj.totals.variableCost, currency)}</b></li>
            <li><HLabel text="Gross Profit" tip="Revenue − Variable Costs." />: <b>{formatCurrency(proj.totals.grossProfit, currency)}</b></li>
            <li><HLabel text="Fixed Costs" tip="Overheads such as rent, salaries, subscriptions." />: <b>{formatCurrency(proj.totals.fixedCosts, currency)}</b></li>
            <li><HLabel text="Operating Profit" tip="Gross Profit − Fixed Costs. Before tax and interest." />: <b>{formatCurrency(proj.totals.operatingProfit, currency)}</b></li>
          </ul>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b border-gray-200 dark:border-gray-800">
              <th className="py-2 pr-4"><HLabel text="Month" tip="Projection period from 1 to 12." /></th>
              <th className="py-2 pr-4"><HLabel text="Units" tip="Projected units sold this month (includes growth rate)." /></th>
              <th className="py-2 pr-4"><HLabel text="Revenue" tip="Price (excl. VAT) × units." /></th>
              <th className="py-2 pr-4"><HLabel text="Variable Cost" tip="Unit cost × units." /></th>
              <th className="py-2 pr-4"><HLabel text="Gross Profit" tip="Revenue − Variable Cost." /></th>
              <th className="py-2 pr-4"><HLabel text="Margin %" tip="Gross Profit ÷ Revenue × 100." /></th>
              <th className="py-2 pr-4"><HLabel text="Fixed Costs" tip="Overheads assumed constant per month." /></th>
              <th className="py-2 pr-4"><HLabel text="Operating Profit" tip="Gross Profit − Fixed Costs." /></th>
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
        Notes: Markup = (Price − Cost) / Cost. Margin = (Price − Cost) / Price. VAT is shown separately; best practice is to price off <b>excl. VAT</b> costs and let tax flow through.
      </p>
    </div>
  );
}
