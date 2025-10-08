// lib/advanced.ts
// Extra calculators used by /advanced page. All numbers are EXCL VAT unless stated.

export const priceFromMargin = (costExcl: number, marginPct: number) =>
    costExcl / (1 - marginPct / 100);
  
  export const priceFromMarkup = (costExcl: number, markupPct: number) =>
    costExcl * (1 + markupPct / 100);
  
  export const costFromMargin = (priceExcl: number, marginPct: number) =>
    priceExcl * (1 - marginPct / 100);
  
  export const marginPctFrom = (priceExcl: number, costExcl: number) =>
    priceExcl > 0 ? ((priceExcl - costExcl) / priceExcl) * 100 : 0;
  
  export const markupPctFrom = (priceExcl: number, costExcl: number) =>
    costExcl > 0 ? ((priceExcl - costExcl) / costExcl) * 100 : 0;
  
  // --- Promos / Discounts ---
  export function applyDiscount(priceExcl: number, discountPct: number) {
    return priceExcl * (1 - discountPct / 100);
  }
  
  export function marginAfterDiscount(
    priceExcl: number,
    costExcl: number,
    discountPct: number
  ) {
    const p = applyDiscount(priceExcl, discountPct);
    return marginPctFrom(p, costExcl);
  }
  
  // Max discount that keeps monthly operating profit >= 0
  export function breakevenDiscountPct(
    priceExcl: number,
    costExcl: number,
    fixedCostsPerMonth: number,
    units: number
  ) {
    const d = 1 - (costExcl + fixedCostsPerMonth / Math.max(units, 1)) / priceExcl;
    return Math.max(0, Math.min(100, d * 100));
  }
  
  // --- Fees / Gateways ---
  export function netAfterFees(priceExcl: number, feePct: number, feeFixed: number) {
    const fee = priceExcl * (feePct / 100) + feeFixed;
    return { net: priceExcl - fee, fee };
  }
  
  export function marginAfterFees(
    priceExcl: number,
    costExcl: number,
    feePct: number,
    feeFixed: number
  ) {
    const { net } = netAfterFees(priceExcl, feePct, feeFixed);
    return priceExcl > 0 ? ((net - costExcl) / priceExcl) * 100 : 0;
  }
  
  // --- Imports / Landed Cost ---
  export function landedCostPerUnit(params: {
    unitCostForeign: number;
    fxRate: number; // ZAR per 1 foreign unit
    freightPerUnitZAR: number;
    dutyPct: number;
    clearancePerUnitZAR: number;
    shrinkagePct?: number;
  }) {
    const {
      unitCostForeign,
      fxRate,
      freightPerUnitZAR,
      dutyPct,
      clearancePerUnitZAR,
      shrinkagePct = 0,
    } = params;
    const base = unitCostForeign * fxRate;
    const duty = base * (dutyPct / 100);
    const raw = base + duty + freightPerUnitZAR + clearancePerUnitZAR;
    const survival = 1 - shrinkagePct / 100;
    return raw / Math.max(survival, 0.0001);
  }
  
  // --- Services / Hourly pricing ---
  export function breakevenHourlyRate(params: {
    monthlyFixedOverheads: number;
    targetMarginPct: number;
    billableHoursPerMonth: number;
    variableCostPerHour: number;
  }) {
    const {
      monthlyFixedOverheads,
      targetMarginPct,
      billableHoursPerMonth,
      variableCostPerHour,
    } = params;
  
    const priceOnVar = variableCostPerHour / (1 - targetMarginPct / 100);
    const overheadPerHour = monthlyFixedOverheads / Math.max(billableHoursPerMonth, 1);
    return priceOnVar + overheadPerHour;
  }
  
  // --- Inventory ---
  export function eoq(
    annualDemand: number,
    orderCost: number,
    holdingCostPerUnitPerYear: number
  ) {
    return Math.sqrt(
      (2 * annualDemand * orderCost) / Math.max(holdingCostPerUnitPerYear, 1e-6)
    );
  }
  
  export function reorderPoint(
    avgDailyDemand: number,
    leadTimeDays: number,
    safetyStockUnits: number
  ) {
    return avgDailyDemand * leadTimeDays + safetyStockUnits;
  }
  
  // --- Subscription (SaaS-like) ---
  export function ltvSimple(arpu: number, gmPct: number, churnPct: number) {
    const m = gmPct / 100;
    const c = churnPct / 100;
    return c <= 0 ? Infinity : (arpu * m) / c;
  }
  
  export function cacPaybackMonths(cac: number, arpu: number, gmPct: number) {
    const monthlyCM = arpu * (gmPct / 100);
    return monthlyCM <= 0 ? Infinity : cac / monthlyCM;
  }
  
  // --- Multi-product mix ---
  export function weightedBreakevenUnits(
    products: { mixPct: number; priceExcl: number; costExcl: number }[],
    fixedCosts: number
  ) {
    const wcm = products.reduce(
      (s, p) => s + (p.mixPct / 100) * (p.priceExcl - p.costExcl),
      0
    );
    return wcm > 0 ? fixedCosts / wcm : Infinity;
  }
  
  // --- Price elasticity (simple linear) ---
  export function revenueMaxPriceLinear(a: number, b: number) {
    return a / (2 * Math.max(b, 1e-9));
  }
  
  // --- VAT summary (very high-level) ---
  export function vatSummary(month: {
    salesExcl: number;
    purchasesExcl: number;
    vatRatePct: number;
  }) {
    const v = month.vatRatePct / 100;
    const outputVAT = month.salesExcl * v;
    const inputVAT = month.purchasesExcl * v;
    return { outputVAT, inputVAT, payable: outputVAT - inputVAT };
  }
  