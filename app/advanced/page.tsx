"use client";

import { useMemo, useState } from "react";
import NumberField from "../../components/NumberField";
import Select from "../../components/Select";
import Tooltip from "../../components/Tooltip";
import {
  formatCurrency,
  priceFromMargin, costFromMargin,
  marginPctFrom, markupPctFrom,
  applyDiscount, marginAfterDiscount, breakevenDiscountPct,
  netAfterFees, marginAfterFees,
  landedCostPerUnit,
  breakevenHourlyRate,
  eoq, reorderPoint,
  ltvSimple, cacPaybackMonths,
  revenueMaxPriceLinear,
} from "../../lib/calculations";
import clsx from "clsx";

type Tab = "Pricing" | "Promos" | "Fees" | "Imports" | "Services" | "Inventory" | "Subscription";

export default function AdvancedPage() {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState<Tab>("Pricing");
  const [currency, setCurrency] = useState("ZAR");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Advanced Calculators</h1>

      <div className="card">
        <button
          className="w-full text-left flex items-center justify-between"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="text-lg font-medium">Advanced</span>
          <span className="text-sm">{open ? "Hide" : "Show"}</span>
        </button>

        {open && (
          <div className="mt-4 space-y-6">
            <div className="flex flex-wrap gap-2">
              {(["Pricing","Promos","Fees","Imports","Services","Inventory","Subscription"] as Tab[])
                .map((t) => (
                <button
                  key={t}
                  className={clsx(
                    "btn px-3 py-1",
                    active === t ? "bg-indigo-700" : "bg-indigo-600"
                  )}
                  onClick={() => setActive(t)}
                >
                  {t}
                </button>
              ))}
              <div className="ml-auto">
                <Select
                  label="Currency"
                  value={currency}
                  onChange={setCurrency}
                  options={[
                    { label: "ZAR", value: "ZAR" },
                    { label: "USD", value: "USD" },
                    { label: "EUR", value: "EUR" },
                  ]}
                  tooltip="Display currency for this page’s outputs."
                />
              </div>
            </div>

            {active === "Pricing" && <PricingPanel currency={currency} />}
            {active === "Promos" && <PromosPanel currency={currency} />}
            {active === "Fees" && <FeesPanel currency={currency} />}
            {active === "Imports" && <ImportsPanel currency={currency} />}
            {active === "Services" && <ServicesPanel currency={currency} />}
            {active === "Inventory" && <InventoryPanel />}
            {active === "Subscription" && <SubscriptionPanel currency={currency} />}
          </div>
        )}
      </div>
    </div>
  );
}

/* -------------------- PRICING -------------------- */
function PricingPanel({ currency }: { currency: string }) {
  const [solveFor, setSolveFor] = useState<"price" | "margin" | "markup" | "cost">("price");
  const [costExcl, setCost] = useState(100);
  const [priceExcl, setPrice] = useState(0);
  const [marginPct, setMargin] = useState(30);
  const [markupPct, setMarkup] = useState(0);

  const out = useMemo(() => {
    let p = priceExcl, c = costExcl, m = marginPct;
    try {
      if (solveFor === "price") p = priceFromMargin(c, m);
      if (solveFor === "margin") m = marginPctFrom(p, c);
      if (solveFor === "cost") c = costFromMargin(p, m);
    } catch {}
    const margin = marginPctFrom(p, c);
    const markup = markupPctFrom(p, c);
    return { p, c, margin, markup };
  }, [solveFor, priceExcl, costExcl, marginPct]);

  return (
    <div className="grid2">
      <div className="card space-y-4">
        <Select
          label="Solve for"
          value={solveFor}
          onChange={(v) =>
            setSolveFor(v as "price" | "margin" | "markup" | "cost")
          }
          options={[
            { label: "Price", value: "price" },
            { label: "Margin %", value: "margin" },
            { label: "Markup %", value: "markup" },
            { label: "Cost", value: "cost" },
          ]}
          help="Enter the other values; we compute this one."
          tooltip="Choose which variable to calculate automatically."
        />
        <NumberField label="Cost (excl.)" value={costExcl} onChange={setCost} min={0}
          tooltip="All direct costs per unit/job/hour—exclude VAT." />
        <NumberField label="Price (excl.)" value={priceExcl} onChange={setPrice} min={0}
          tooltip="Selling price before VAT." />
        <NumberField label="Target Margin %" value={marginPct} onChange={setMargin} min={0} step={0.1}
          tooltip="(Price − Cost) ÷ Price × 100" />
        <NumberField label="Target Markup %" value={markupPct} onChange={setMarkup} min={0} step={0.1}
          tooltip="(Price − Cost) ÷ Cost × 100" />
      </div>

      <div className="card space-y-2">
        <p className="flex items-center gap-1">Price (excl.): <Tooltip text="Resulting pre-VAT selling price." /> <b>{formatCurrency(out.p, currency)}</b></p>
        <p className="flex items-center gap-1">Cost (excl.): <Tooltip text="Implied or entered direct unit cost (pre-VAT)." /> <b>{formatCurrency(out.c, currency)}</b></p>
        <p className="flex items-center gap-1">Margin: <Tooltip text="Profit as % of selling price." /> <b>{out.margin.toFixed(2)}%</b></p>
        <p className="flex items-center gap-1">Markup: <Tooltip text="Profit as % of cost." /> <b>{out.markup.toFixed(2)}%</b></p>
      </div>
    </div>
  );
}

/* -------------------- PROMOS -------------------- */
function PromosPanel({ currency }: { currency: string }) {
  const [priceExcl, setPrice] = useState(200);
  const [costExcl, setCost] = useState(120);
  const [discountPct, setDisc] = useState(10);
  const [fixedCostsPerMonth, setFixed] = useState(10000);
  const [units, setUnits] = useState(200);

  const newPrice = applyDiscount(priceExcl, discountPct);
  const newMargin = marginAfterDiscount(priceExcl, costExcl, discountPct);
  const maxSafeDisc = breakevenDiscountPct(priceExcl, costExcl, fixedCostsPerMonth, units);

  return (
    <div className="grid2">
      <div className="card space-y-2">
        <NumberField label="Price (excl.)" value={priceExcl} onChange={setPrice} min={0}
          tooltip="Current full price before discount (excl. VAT)." />
        <NumberField label="Cost (excl.)" value={costExcl} onChange={setCost} min={0}
          tooltip="Unit direct cost (excl. VAT)." />
        <NumberField label="Discount %" value={discountPct} onChange={setDisc} min={0} step={0.1}
          tooltip="Promotional reduction on price." />
        <NumberField label="Fixed costs / month" value={fixedCostsPerMonth} onChange={setFixed} min={0}
          tooltip="Overheads used to check if the discount still keeps operating profit ≥ 0." />
        <NumberField label="Units / month" value={units} onChange={setUnits} min={0} step={1}
          tooltip="Expected monthly volume during the promo." />
      </div>

      <div className="card space-y-2">
        <p className="flex items-center gap-1">Discounted price: <Tooltip text="New price after discount (excl. VAT)." /> <b>{formatCurrency(newPrice, currency)}</b></p>
        <p className="flex items-center gap-1">Margin after discount: <Tooltip text="Your gross margin % at the discounted price." /> <b>{newMargin.toFixed(2)}%</b></p>
        <p className="flex items-center gap-1">Max safe discount: <Tooltip text="Largest discount before operating profit goes ≤ 0, given your fixed costs & volume." /> <b>{maxSafeDisc.toFixed(2)}%</b></p>
      </div>
    </div>
  );
}

/* -------------------- FEES -------------------- */
function FeesPanel({ currency }: { currency: string }) {
  const [priceExcl, setPrice] = useState(250);
  const [costExcl, setCost] = useState(150);
  const [feePct, setFeePct] = useState(2.9);
  const [feeFixed, setFeeFixed] = useState(2);

  const { net, fee } = netAfterFees(priceExcl, feePct, feeFixed);
  const m = marginAfterFees(priceExcl, costExcl, feePct, feeFixed);

  return (
    <div className="grid2">
      <div className="card space-y-2">
        <NumberField label="Price (excl.)" value={priceExcl} onChange={setPrice} min={0}
          tooltip="Listed selling price before VAT and before fees are deducted." />
        <NumberField label="Cost (excl.)" value={costExcl} onChange={setCost} min={0}
          tooltip="Direct cost per unit (excl. VAT)." />
        <NumberField label="Gateway fee %" value={feePct} onChange={setFeePct} min={0} step={0.1}
          tooltip="Percentage fee charged by the payment processor/marketplace." />
        <NumberField label="Fixed fee" value={feeFixed} onChange={setFeeFixed} min={0} step={0.1}
          tooltip="Flat fee per transaction, if any." />
      </div>
      <div className="card space-y-2">
        <p className="flex items-center gap-1">Fees: <Tooltip text="% + fixed fee amount per unit at this price." /> <b>{formatCurrency(fee, currency)}</b></p>
        <p className="flex items-center gap-1">Net after fees: <Tooltip text="What you receive after platform/payment fees, before costs." /> <b>{formatCurrency(net, currency)}</b></p>
        <p className="flex items-center gap-1">Margin after fees: <Tooltip text="(Net − Cost) ÷ Price × 100." /> <b>{m.toFixed(2)}%</b></p>
      </div>
    </div>
  );
}

/* -------------------- IMPORTS -------------------- */
function ImportsPanel({ currency }: { currency: string }) {
  const [unitCostForeign, setUcf] = useState(10);
  const [fxRate, setFx] = useState(18.5);
  const [freight, setFreight] = useState(4);
  const [dutyPct, setDuty] = useState(10);
  const [clearance, setClear] = useState(1.5);
  const [shrink, setShrink] = useState(2);
  const [targetMargin, setTargetM] = useState(35);

  const landed = landedCostPerUnit({
    unitCostForeign,
    fxRate,
    freightPerUnitZAR: freight,
    dutyPct,
    clearancePerUnitZAR: clearance,
    shrinkagePct: shrink,
  });
  const requiredPrice = priceFromMargin(landed, targetMargin);

  return (
    <div className="grid2">
      <div className="card space-y-2">
        <NumberField label="Unit cost (foreign)" value={unitCostForeign} onChange={setUcf} min={0}
          tooltip="Supplier price in foreign currency." />
        <NumberField label="FX rate (ZAR / 1 foreign)" value={fxRate} onChange={setFx} min={0} step={0.0001}
          tooltip="Exchange rate used to convert costs to ZAR." />
        <NumberField label="Freight / unit (ZAR)" value={freight} onChange={setFreight} min={0}
          tooltip="Shipping cost allocated per unit." />
        <NumberField label="Duty %" value={dutyPct} onChange={setDuty} min={0} step={0.1}
          tooltip="Import duty as a % of customs value." />
        <NumberField label="Clearance / unit (ZAR)" value={clearance} onChange={setClear} min={0}
          tooltip="Brokerage, port fees and other per-unit charges." />
        <NumberField label="Shrinkage %" value={shrink} onChange={setShrink} min={0} step={0.1}
          tooltip="Expected loss/damage. We gross-up cost so survivors carry full cost." />
        <NumberField label="Target margin %" value={targetMargin} onChange={setTargetM} min={0} step={0.1}
          tooltip="Desired gross margin on the landed cost." />
      </div>
      <div className="card space-y-2">
        <p className="flex items-center gap-1">Landed cost / unit: <Tooltip text="Total cost per sellable unit after fx, duty, freight, clearance and shrinkage." /> <b>{formatCurrency(landed, currency)}</b></p>
        <p className="flex items-center gap-1">Required price: <Tooltip text="Price (excl. VAT) that achieves your target margin." /> <b>{formatCurrency(requiredPrice, currency)}</b></p>
      </div>
    </div>
  );
}

/* -------------------- SERVICES -------------------- */
function ServicesPanel({ currency }: { currency: string }) {
  const [monthlyFixedOverheads, setFixed] = useState(120000);
  const [targetMarginPct, setTargetM] = useState(40);
  const [billableHoursPerMonth, setBillable] = useState(120);
  const [variableCostPerHour, setVar] = useState(150);

  const rate = breakevenHourlyRate({
    monthlyFixedOverheads,
    targetMarginPct,
    billableHoursPerMonth,
    variableCostPerHour,
  });

  return (
    <div className="grid2">
      <div className="card space-y-2">
        <NumberField label="Monthly fixed overheads" value={monthlyFixedOverheads} onChange={setFixed} min={0}
          tooltip="All monthly overheads: salaries, rent, tools, etc." />
        <NumberField label="Target margin %" value={targetMarginPct} onChange={setTargetM} min={0} step={0.1}
          tooltip="Desired gross margin on billable rates before overheads." />
        <NumberField label="Billable hours / month" value={billableHoursPerMonth} onChange={setBillable} min={1} step={1}
          tooltip="Hours actually billed (capacity × utilisation)." />
        <NumberField label="Variable cost / hour" value={variableCostPerHour} onChange={setVar} min={0}
          tooltip="Direct hourly cost (contractor cost, software per-hour, etc.)." />
      </div>
      <div className="card space-y-2">
        <p className="flex items-center gap-1">Breakeven hourly rate: <Tooltip text="Minimum hourly price to hit the target margin and cover monthly overheads." /> <b>{formatCurrency(rate, currency)}</b></p>
      </div>
    </div>
  );
}

/* -------------------- INVENTORY -------------------- */
function InventoryPanel() {
  const [annualDemand, setD] = useState(24000);
  const [orderCost, setS] = useState(500);
  const [holdingCost, setH] = useState(12);
  const [avgDailyDemand, setDd] = useState(80);
  const [leadTimeDays, setLt] = useState(10);
  const [safetyStock, setSs] = useState(200);

  const q = eoq(annualDemand, orderCost, holdingCost);
  const rop = reorderPoint(avgDailyDemand, leadTimeDays, safetyStock);

  return (
    <div className="grid2">
      <div className="card space-y-2">
        <NumberField label="Annual demand (units)" value={annualDemand} onChange={setD} min={1} step={1}
          tooltip="Total expected sales volume per year." />
        <NumberField label="Order cost (ZAR / order)" value={orderCost} onChange={setS} min={0}
          tooltip="Admin & shipping cost each time you place an order." />
        <NumberField label="Holding cost (ZAR / unit / year)" value={holdingCost} onChange={setH} min={0}
          tooltip="Cost to keep one unit in stock for a year (space, capital, risk)." />
        <NumberField label="Avg daily demand (units)" value={avgDailyDemand} onChange={setDd} min={0}
          tooltip="Typical units sold per day." />
        <NumberField label="Lead time (days)" value={leadTimeDays} onChange={setLt} min={0} step={1}
          tooltip="Days between placing the order and receiving stock." />
        <NumberField label="Safety stock (units)" value={safetyStock} onChange={setSs} min={0} step={1}
          tooltip="Buffer stock to cover variability and delays." />
      </div>
      <div className="card space-y-2">
        <p className="flex items-center gap-1">EOQ (units): <Tooltip text="Economic Order Quantity—order size that minimises total ordering + holding costs." /> <b>{q.toFixed(2)}</b></p>
        <p className="flex items-center gap-1">Reorder Point (units): <Tooltip text="Stock level at which you should place the next order: demand during lead time + safety stock." /> <b>{rop.toFixed(0)}</b></p>
      </div>
    </div>
  );
}

/* -------------------- SUBSCRIPTION -------------------- */
function SubscriptionPanel({ currency }: { currency: string }) {
  const [arpu, setArpu] = useState(299);
  const [gmPct, setGm] = useState(70);
  const [churnPct, setChurn] = useState(5);
  const [cac, setCac] = useState(1200);

  const ltv = ltvSimple(arpu, gmPct, churnPct);
  const payback = cacPaybackMonths(cac, arpu, gmPct);

  const [a, setA] = useState(2000);
  const [b, setB] = useState(5);
  const pStar = revenueMaxPriceLinear(a, b);

  return (
    <div className="space-y-6">
      <div className="grid2">
        <div className="card space-y-2">
          <NumberField label="ARPU" value={arpu} onChange={setArpu} min={0}
            tooltip="Average revenue per user per month (excl. VAT)." />
          <NumberField label="Gross margin %" value={gmPct} onChange={setGm} min={0} step={0.1}
            tooltip="(Revenue − Cost of Service) ÷ Revenue × 100." />
          <NumberField label="Monthly churn %" value={churnPct} onChange={setChurn} min={0} step={0.01}
            tooltip="% of customers who cancel each month." />
          <NumberField label="CAC" value={cac} onChange={setCac} min={0}
            tooltip="Customer Acquisition Cost—marketing & sales to win one customer." />
        </div>
        <div className="card space-y-2">
          <p className="flex items-center gap-1">LTV (simple): <Tooltip text="Lifetime value estimate assuming constant churn and margin." /> <b>{formatCurrency(ltv, currency)}</b></p>
          <p className="flex items-center gap-1">CAC payback (months): <Tooltip text="Months to recover CAC using monthly contribution margin." /> <b>{Number.isFinite(payback) ? payback.toFixed(1) : "∞"}</b></p>
        </div>
      </div>

      <div className="grid2">
        <div className="card space-y-2">
          <h3 className="font-medium flex items-center gap-1">Elasticity (toy) <Tooltip text="Linear demand model Q = a − bP (illustrative only, not a forecast)." /></h3>
          <NumberField label="a (intercept)" value={a} onChange={setA} min={0} tooltip="Demand when price is 0 (theoretical)." />
          <NumberField label="b (slope)" value={b} onChange={setB} min={0.0001} step={0.1} tooltip="How much demand drops as price increases." />
        </div>
        <div className="card space-y-2">
          <p className="flex items-center gap-1">Revenue-max price P*: <Tooltip text="Price that maximises P×Q for the simple linear model." /> <b>{formatCurrency(pStar, currency)}</b></p>
        </div>
      </div>
    </div>
  );
}
