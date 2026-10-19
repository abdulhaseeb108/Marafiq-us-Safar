import { allocateRooms, roomCostPerNight } from "./rooms.js";
import { RULES } from "./rules.js";

// ASSUMPTION: confirm with WMT what the package includes.
function packageRatePp(travelers) {
  if (travelers === 1) return 700;
  if (travelers === 2) return 675;
  if (travelers === 3) return 650;
  if (travelers === 4) return 625;
  return 575; // 5 or more
}

function hotelCost(nightlySeasons, rooms) {
  let total = 0;
  for (const season of nightlySeasons) {
    for (const size of rooms) total += roomCostPerNight(season, size);
  }
  return total;
}

const pct = (amount, p) => Math.round((amount * p) / 100);

export function calculate(inputs, rules = RULES) {
  const {
    adults,
    children = 0,
    infants = 0,
    roomType = 4,
    makkahSeasons,
    madinahSeasons,
  } = inputs;

  // Children are priced as adults (assumption). Infants have no bed.
  const paying = adults + children;
  const rooms = allocateRooms(paying, roomType);

  const packageSar =
    packageRatePp(paying) * paying + infants * rules.infantPackageSar;
  const makkahSar = hotelCost(makkahSeasons, rooms);
  const madinahSar = hotelCost(madinahSeasons, rooms);

  const supplierSar = packageSar + makkahSar + madinahSar;
  const serviceSar = pct(supplierSar, rules.serviceChargePct);
  const paymentSar = pct(supplierSar + serviceSar, rules.paymentCostPct);
  const feesSar = serviceSar + paymentSar;

  const totalSar = supplierSar + feesSar;
  const highSar = totalSar + pct(totalSar, rules.rangeBufferPct);

  const fx = rules.fxSarToPkr * (1 + rules.fxBufferPct / 100);
  const totalPkr = Math.round(totalSar * fx);
  const highPkr = Math.round(highSar * fx);
  const travelers = paying + infants;

  return {
    ruleVersion: rules.version,
    lineItems: [
      { label: "Package (visa and transport)", sar: packageSar },
      { label: "Makkah hotel", sar: makkahSar },
      { label: "Madinah hotel", sar: madinahSar },
      { label: "Service and payment fee", sar: feesSar },
    ],
    supplierSar,
    totalSar,
    highSar,
    totalPkr,
    highPkr,
    perPersonPkr: Math.round(totalPkr / travelers),
    rooms,
    assumptions: [
      `Rooms: ${rooms.join(" + ")} guests per room. A guest alone in a room pays the full room rate.`,
      "Children are priced as adults. Infants pay the infant package fee and have no hotel bed.",
      "Flights, meals and ziyarah are not included. Package inclusions must be confirmed with the supplier.",
      `Exchange rate used: 1 SAR = ${fx.toFixed(2)} PKR (includes a ${rules.fxBufferPct}% buffer).`,
      `The higher figure adds ${rules.rangeBufferPct}% because supplier rates can change without notice.`,
    ],
  };
}