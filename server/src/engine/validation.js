export function isCalendarDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function validTravelerCounts({ adults, children = 0, infants = 0 } = {}) {
  return Number.isInteger(adults) && adults >= 1 && adults <= 30 &&
    Number.isInteger(children) && children >= 0 && children <= 30 &&
    Number.isInteger(infants) && infants >= 0 && infants <= adults &&
    adults + children <= 60;
}

export function validStayNights({ makkahNights, madinahNights } = {}) {
  return [makkahNights, madinahNights].every(
    (nights) => Number.isInteger(nights) && nights >= 1 && nights <= 60
  );
}

export function isSupportedEstimateRoute(route = "route1") {
  return ["route1", "route2", "madinah-makkah"].includes(route);
}

export function isKnownRoute(route) {
  return ["route1", "route2", "route3", "route4", "custom"].includes(route);
}
