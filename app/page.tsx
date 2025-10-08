"use client";
import NumberField from "../components/NumberField";
import Select from "../components/Select";
import Results from "../components/Results";
import {
  Input, computeCore, project12Months,
  marginPctToMarkupPct, markupPctToMarginPct
} from "../lib/calculations";
import { useMemo, useState } from "react";
import clsx from "clsx";

export default function Page() {
  const [kind, setKind] = useState<"goods" | "services">("goods");
  const [currency, setCurrency] = useState("ZAR");
  const [vatRatePct, setVatRatePct] = useState(15);
  const [includeVatInPrice, setIncludeVatInPrice] = useState(true);

  const [variableCostPerUnit, setVarCost] = useState(100);
  const [fixedCostsPerMonth, setFixed] = useState(10000);
  const [unitsPerMonth, setUnits] = useState(200);

  const [mode, setMode] = useState<"markup" | "margin">("markup");
  const [valuePct, setValuePct] = useState(40); // default markup 40%

  const [growthRatePct, setGrowth] = useState(3);

  const syncValue = (pct: number, targetMode: "markup"|"margin") => {
    if (targetMode === "markup" && mode === "margin") return marginPctToMarkupPct(pct);
    if (targetMode === "margin" && mode === "markup") return markupPctToMarginPct(pct);
    return pct;
  };

  const { core, proj, error } = useMemo(() => {
    try {
      const input: Input = {
        kind, currency, vatRatePct, includeVatInPrice,
        variableCostPerUnit, fixedCostsPerMonth, unitsPerMonth,
        mode, valuePct, growthRatePct: growthRatePct
      };
      const core = computeCore(input);
      const proj = project12Months(input, core);
      return { core, proj, error: null as string | null };
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      return { core: null, proj: null, error: message };
    }
  }, [
    kind, currency, vatRatePct, includeVatInPrice,
    variableCostPerUnit, fixedCostsPerMonth, unitsPerMonth,
    mode, valuePct, growthRatePct
  ]);

  return (
    <div className="space-y-6">
      <div className="card space-y-6">
        <h2 className="text-xl font-semibold">Inputs</h2>
        <div className="grid2">
          <Select
            label="Business Type"
            value={kind}
            onChange={(v)=>setKind(v === "goods" ? "goods" : "services")}
            options={[
              { label: "Goods (products)", value: "goods" },
              { label: "Services", value: "services" }
            ]}
            help="This is just a label; calculations are the same."
            tooltip="Choose what you sell. This only changes labels; the maths stay the same."
          />
          <Select
            label="Currency"
            value={currency}
            onChange={setCurrency}
            options={[
              {label:"South African Rand (ZAR)", value:"ZAR"},
              {label:"US Dollar (USD)", value:"USD"},
              {label:"Euro (EUR)", value:"EUR"}
            ]}
            help="Used for formatting values."
            tooltip="Display currency for numbers. No FX conversion in core model."
          />
          <NumberField
            label="VAT rate"
            value={vatRatePct}
            onChange={setVatRatePct}
            min={0}
            step={0.1}
            suffix="%"
            help="SA default is 15%."
            tooltip="Your VAT percentage. We price off EXCL VAT and show VAT separately."
          />
          <label className="toggle">
            <input
              type="checkbox"
              checked={includeVatInPrice}
              onChange={(e)=>setIncludeVatInPrice(e.target.checked)}
            />
            Include VAT in displayed selling price
          </label>
        </div>

        <div className="grid2">
          <NumberField
            label="Variable cost per unit"
            value={variableCostPerUnit}
            onChange={setVarCost}
            min={0}
            help="Direct cost per unit / job / hour."
            tooltip="All direct costs per unit (materials, direct labour, packaging). Exclude VAT."
          />
          <NumberField
            label="Fixed costs per month"
            value={fixedCostsPerMonth}
            onChange={setFixed}
            min={0}
            help="Rent, salaries, software, overheads."
            tooltip="Overheads you pay regardless of volume. Used for breakeven calc."
          />
          <NumberField
            label="Expected units per month"
            value={unitsPerMonth}
            onChange={setUnits}
            min={0}
            step={1}
            tooltip="Typical quantity sold/fulfilled per month."
          />
          <NumberField
            label="Monthly growth rate"
            value={growthRatePct}
            onChange={setGrowth}
            min={-100}
            step={0.1}
            suffix="%"
            help="Used for 12-month projection."
            tooltip="Percentage change in monthly units. Applies compounding over 12 months."
          />
        </div>

        <div className="grid2">
          <div className="space-y-2">
            <div className="flex gap-3">
              <button
                className={clsx("btn", mode==="markup" && "bg-indigo-700")}
                onClick={()=>{
                  setValuePct(syncValue(valuePct,"markup"));
                  setMode("markup");
                }}
                aria-label="Use markup % mode"
                title="Markup = (Price − Cost) ÷ Cost"
              >Markup %</button>
              <button
                className={clsx("btn", mode==="margin" && "bg-indigo-700")}
                onClick={()=>{
                  setValuePct(syncValue(valuePct,"margin"));
                  setMode("margin");
                }}
                aria-label="Use margin % mode"
                title="Margin = (Price − Cost) ÷ Price"
              >Margin %</button>
            </div>
            <NumberField
              label={mode === "markup" ? "Markup %" : "Margin %"}
              value={valuePct}
              onChange={setValuePct}
              min={0}
              step={0.1}
              suffix="%"
              help={mode === "markup"
                ? "Markup = (Price − Cost) / Cost"
                : "Margin = (Price − Cost) / Price"}
              tooltip={mode === "markup"
                ? "Enter desired % uplift on cost to set price."
                : "Enter desired % of price that is profit (before overheads)."}
            />
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-600">Error: {error}</div>
        )}
      </div>

      {core && proj && <Results core={core} proj={proj} currency={currency} />}
    </div>
  );
}
