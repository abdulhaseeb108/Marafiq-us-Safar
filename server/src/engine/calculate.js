// Package price per person in SAR, depending on group size.
// ASSUMPTION: confirm with WMT what the package includes.
function getPackageRatePp(adults) {
  if (adults === 1) return 700;
  if (adults === 2) return 675;
  if (adults === 3) return 650;
  if (adults === 4) return 625;
  return 575; // 5 or more
}

export function calculate(inputs) {
  const {
    adults,
    makkahNights,
    madinahNights,
    makkahRatePp,   // SAR per person per night
    madinahRatePp,  // SAR per person per night
  } = inputs;

  const packageTotal = getPackageRatePp(adults) * adults;
  const makkahTotal = makkahRatePp * adults * makkahNights;
  const madinahTotal = madinahRatePp * adults * madinahNights;

  const totalSar = packageTotal + makkahTotal + madinahTotal;

  return {
    lineItems: [
      { label: "Package (visa and transport)", sar: packageTotal },
      { label: "Makkah hotel", sar: makkahTotal },
      { label: "Madinah hotel", sar: madinahTotal },
    ],
    totalSar,
    perPersonSar: totalSar / adults,
  };
}