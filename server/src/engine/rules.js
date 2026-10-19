// All business numbers live here. CHANGE THESE to your real values.
export const RULES = {
  version: "2026-10-v1",
  fxSarToPkr: 75,        // PKR for 1 SAR. Use today's real rate.
  fxBufferPct: 1,        // safety margin on the exchange rate
  serviceChargePct: 5,   // your service fee/margin, % of supplier cost
  paymentCostPct: 2,     // payment processing cost, %
  rangeBufferPct: 8,     // "high" price = estimate + this %, because rates can change
  infantPackageSar: 460, // from the WMT sheet
};