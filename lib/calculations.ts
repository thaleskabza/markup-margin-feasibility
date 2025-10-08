// lib/calculations.ts
// Core unit-economics + 12-month projection, plus handy exports.

export type Mode = "markup" | "margin";

export type Input = {
  kind: "goods" | "services";
  currency: string; // e.g., "ZAR"
  vatRatePct: number; // 15 for 15%
  includeVatInPrice: boolean; // if true, SP includes VAT
  variableCostPerUnit: number; // excl. VAT
  fixedCostsPerMonth: number; // overheads
  unitsPerMonth: number; // expected volume
  mode: Mode;
  valuePct: number; // markup % OR margin %
  growthRatePct: number; // monthly growth for projections
};

export type Core = {
  costExcl: number;
  priceExcl: number;
  vatAmountPerUnit: number;
  priceIncl: number;
  markupPct: number; // (P - C) / C * 100
  marginPct: number; // (P - C) / P * 100
  unitProfitExcl: number;
  breakevenUnits: number | null; // null if unitProfit <= 0
};

export function pctToDec(pct: number) {
  return pct / 100;
}

/** Convert margin% <-> markup% */
export function marginPctToMarkupPct(marginPct: number) {
  const m = marginPct / 100;
  if (m >= 1) throw new Error("Margin % must be < 100");
  const k = m / (1 - m);
  return k * 100;
}
export function markupPctToMarginPct(markupPct: number) {
  const k = markupPct / 100;
  const m = k / (1 + k);
  return m * 100;
}

/** Compute core unit economics */
export function computeCore(i: Input): Core {
  const C = i.variableCostPerUnit; // excl VAT
  let priceExcl: number;

  if (i.mode === "markup") {
    const k = pctToDec(i.valuePct);
    priceExcl = C * (1 + k);
  } else {
    const m = pctToDec(i.valuePct);
    if (m >= 1) throw new Error("Margin % must be < 100");
    priceExcl = C / (1 - m);
  }

  const vatDec = pctToDec(i.vatRatePct);
  const vatPerUnit = priceExcl * vatDec;
  const priceIncl = i.includeVatInPrice ? priceExcl * (1 + vatDec) : priceExcl;

  const unitProfitExcl = priceExcl - C;
  const markupPct = ((priceExcl - C) / C) * 100;
  const marginPct = ((priceExcl - C) / priceExcl) * 100;
  const contPerUnit = unitProfitExcl;
  const breakevenUnits =
    contPerUnit > 0 ? i.fixedCostsPerMonth / contPerUnit : null;

  return {
    costExcl: C,
    priceExcl,
    vatAmountPerUnit: vatPerUnit,
    priceIncl,
    markupPct,
    marginPct,
    unitProfitExcl,
    breakevenUnits,
  };
}

export type MonthRow = {
  month: number;
  units: number;
  revenueExcl: number;
  variableCost: number;
  grossProfit: number;
  marginPct: number;
  fixedCosts: number;
  operatingProfit: number;
};

export type Projection = {
  rows: MonthRow[];
  totals: {
    revenueExcl: number;
    variableCost: number;
    grossProfit: number;
    fixedCosts: number;
    operatingProfit: number;
  };
};

export function project12Months(i: Input, core: Core): Projection {
  const rows: MonthRow[] = [];
  let units = i.unitsPerMonth;
  for (let m = 1; m <= 12; m++) {
    const rev = core.priceExcl * units;
    const vc = i.variableCostPerUnit * units;
    const gp = rev - vc;
    const marginPct = rev > 0 ? (gp / rev) * 100 : 0;
    const op = gp - i.fixedCostsPerMonth;

    rows.push({
      month: m,
      units,
      revenueExcl: rev,
      variableCost: vc,
      grossProfit: gp,
      marginPct,
      fixedCosts: i.fixedCostsPerMonth,
      operatingProfit: op,
    });

    units = units * (1 + pctToDec(i.growthRatePct));
  }

  const totals = rows.reduce(
    (acc, r) => {
      acc.revenueExcl += r.revenueExcl;
      acc.variableCost += r.variableCost;
      acc.grossProfit += r.grossProfit;
      acc.fixedCosts += r.fixedCosts;
      acc.operatingProfit += r.operatingProfit;
      return acc;
    },
    {
      revenueExcl: 0,
      variableCost: 0,
      grossProfit: 0,
      fixedCosts: 0,
      operatingProfit: 0,
    }
  );

  return { rows, totals };
}

export function formatCurrency(n: number, currency: string, locale = "en-ZA") {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(n);
}

// Re-export advanced helpers so consumers can import from one place:
export {
  priceFromMargin,
  priceFromMarkup,
  costFromMargin,
  marginPctFrom,
  markupPctFrom,
  applyDiscount,
  marginAfterDiscount,
  breakevenDiscountPct,
  netAfterFees,
  marginAfterFees,
  landedCostPerUnit,
  breakevenHourlyRate,
  eoq,
  reorderPoint,
  ltvSimple,
  cacPaybackMonths,
  weightedBreakevenUnits,
  revenueMaxPriceLinear,
} from "./advanced";
