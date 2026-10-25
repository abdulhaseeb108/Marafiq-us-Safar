// Returns the rate row that applies to each night of a stay.
export function getNightlySeasons(hotel, startDate, nights) {
  if (hotel.pricingStyle === "on_request") {
    throw new Error(`${hotel.name}: price is on booking. Please ask our team for a quote.`);
  }
  const list = [];
  const day = new Date(startDate + "T00:00:00Z");

  for (let i = 0; i < nights; i++) {
    const label = day.toISOString().slice(0, 10);
    const s = hotel.seasons.find((x) => day >= new Date(x.start) && day <= new Date(x.end));
    if (!s) throw new Error(`No rate for ${hotel.name} on ${label}`);
    if (hotel.availableFrom && day < new Date(hotel.availableFrom)) {
      throw new Error(`${hotel.name} is not available on ${label}`);
    }
    list.push({
      share: s.share, quad: s.quad, triple: s.triple, double: s.double, room: s.room,
      style: hotel.pricingStyle,
    });
    day.setUTCDate(day.getUTCDate() + 1);
  }
  return list;
}