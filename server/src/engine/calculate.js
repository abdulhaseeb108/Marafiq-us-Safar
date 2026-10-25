import { allocateRooms, roomCostPerNight, need } from "./rooms.js";
import { RULES } from "./rules.js";

// Visa/package price per person, from the WMT sheet, by group size.
// ASSUMPTION: confirm with WMT what the package includes.
function packageRatePp(travelers) {
  if (travelers === 1) return 700;
  if (travelers === 2) return 675;
  if (travelers === 3) return 650;
  if (travelers === 4) return 625;
  return 575; // 5 or more
}

// Returns the cost of every night for the whole group.
function hotelCost(nightlySeasons, rooms, paying, sharing) {
  const nightly = nightlySeasons.map((season) => {
    if (sharing && season.style !== "room_only") return need(season.share) * paying;
    return rooms.reduce((sum, size) => sum + roomCostPerNight(season, size), 0);
  });
  return { total: nightly.reduce((a, b) => a + b, 0), nightly };
}

const pct = (amount, p) => Math.round((amount * p) / 100);

export function calculate(inputs, rules = RULES) {
  const {
    adults, children = 0, infants = 0, roomType = 4,
    roomAllocations, makkahSeasons, madinahSeasons,
  } = inputs;

  const sharing = roomType === "sharing";
  const preferred = sharing || roomType === "any" ? 4 : roomType;

  const paying = adults + children; // children are priced as adults
  const rooms = roomAllocations?.length ? roomAllocations : allocateRooms(paying, preferred);

  const perPerson = packageRatePp(paying);
  const packageSar = perPerson * paying + infants * rules.infantPackageSar;
  const mk = hotelCost(makkahSeasons, rooms, paying, sharing);
  const md = hotelCost(madinahSeasons, rooms, paying, sharing);

  const supplierSar = packageSar + mk.total + md.total;
  const serviceSar = pct(supplierSar, rules.serviceChargePct);
  const paymentSar = pct(supplierSar + serviceSar, rules.paymentCostPct);
  const feesSar = serviceSar + paymentSar;

  const totalSar = supplierSar + feesSar;
  const highSar = totalSar + pct(totalSar, rules.rangeBufferPct);

  const fx = rules.fxSarToPkr * (1 + rules.fxBufferPct / 100);
  const totalPkr = Math.round(totalSar * fx);
  const highPkr = Math.round(highSar * fx);
  const travelers = paying + infants;

  const roomNote = sharing
    ? "Sharing: priced per person per night for a bed in a shared room. Guests may be placed with others."
    : `Rooms: ${rooms.join(" + ")} guests per room.` +
      (roomType === "any" ? " 'Any room type' is priced as quad, the lowest family rate on the supplier sheets." : "") +
      " A guest alone in a room pays the full room rate.";

  return {
    ruleVersion: rules.version,
    pkg: { perPerson, payers: paying, infants, infantSar: rules.infantPackageSar },
    lineItems: [
      { label: "Package (visa and transport)", sar: packageSar },
      { label: "Makkah hotel", sar: mk.total },
      { label: "Madinah hotel", sar: md.total },
      { label: "Service and payment fee", sar: feesSar },
    ],
    hotelNightly: { makkah: mk.nightly, madinah: md.nightly },
    supplierSar, totalSar, highSar, totalPkr, highPkr, fxSarToPkr: fx,
    perPersonPkr: Math.round(totalPkr / travelers),
    rooms,
    assumptions: [
      roomNote,
      rules.infantPackageSar === 0
        ? "Infants (under 2) are not charged and have no hotel bed."
        : "Infants pay the infant package fee and have no hotel bed.",
      "Flights, meals and ziyarat are not included. Package inclusions must be confirmed with the supplier.",
      `Exchange rate used: 1 SAR = ${fx.toFixed(2)} PKR (includes a ${rules.fxBufferPct}% buffer).`,
      `The higher figure adds ${rules.rangeBufferPct}% because supplier rates can change without notice.`,
    ],
  };
}