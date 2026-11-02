import { RULES } from "../engine/rules.js";
import { isCalendarDate } from "../engine/validation.js";
import {
  DATABASE_UNAVAILABLE_MESSAGE, findHotels, isDatabaseConnected, useOfflineHotels,
} from "./databaseMode.js";

export async function listHotels(city, date = "2026-11-10") {
  if (city && !["makkah", "madinah"].includes(city)) {
    return { status: 400, error: "Select a supported hotel city." };
  }
  if (!isCalendarDate(date)) {
    return { status: 400, error: "Enter a valid calendar date." };
  }

  const day = new Date(`${date}T00:00:00Z`);
  const filter = { active: true, ...(city ? { city } : {}) };
  const offline = useOfflineHotels();
  if (!offline && !isDatabaseConnected()) {
    return { status: 503, error: DATABASE_UNAVAILABLE_MESSAGE };
  }

  const availableHotels = await findHotels(filter, offline);
  const markup = (1 + RULES.serviceChargePct / 100) * (1 + RULES.paymentCostPct / 100);
  const fxSarToPkr = RULES.fxSarToPkr * (1 + RULES.fxBufferPct / 100);
  const hotels = availableHotels.map((hotel) => {
    const base = {
      _id: hotel._id, city: hotel.city, name: hotel.name, oldName: hotel.oldName, area: hotel.area,
      distanceM: hotel.distanceM, distanceText: hotel.distanceText, category: hotel.category,
      shuttle: hotel.shuttle, pricingStyle: hotel.pricingStyle, notes: hotel.notes, fxSarToPkr,
    };
    if (hotel.pricingStyle === "on_request") return { ...base, onRequest: true };

    const season = hotel.seasons.find((item) => day >= item.start && day <= item.end);
    if (!season || (hotel.availableFrom && day < hotel.availableFrom)) {
      return { ...base, noRate: true };
    }

    const rates = Object.fromEntries(
      ["share", "quad", "triple", "double", "room"].map((key) => [
        key,
        season[key] == null ? null : Math.round(season[key] * markup),
      ])
    );
    const ratesPkr = Object.fromEntries(
      Object.entries(rates).map(([key, value]) => [
        key,
        value == null ? null : Math.round(value * fxSarToPkr),
      ])
    );
    return { ...base, rates, ratesPkr, perPersonQuad: rates.quad, perRoom: rates.room };
  });

  return { status: 200, data: hotels };
}
