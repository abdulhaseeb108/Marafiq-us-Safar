// Returns the season (rate row) that applies to each night of a stay.
export function getNightlySeasons(hotel, startDate, nights) {
  const list = [];
  const day = new Date(startDate + "T00:00:00Z");

  for (let i = 0; i < nights; i++) {
    const season = hotel.seasons.find(
      (s) => day >= new Date(s.start) && day <= new Date(s.end)
    );
    if (!season) {
      throw new Error(
        `No rate for ${hotel.name} on ${day.toISOString().slice(0, 10)}`
      );
    }
    list.push(season);
    day.setUTCDate(day.getUTCDate() + 1);
  }
  return list;
}