// Split guests into rooms. preferred = 4, 3 or 2 guests per room.
// Example: 5 guests, preferred 4 -> [4, 1]
export function allocateRooms(guests, preferred) {
  const rooms = [];
  let left = guests;
  while (left >= preferred) {
    rooms.push(preferred);
    left -= preferred;
  }
  if (left > 0) rooms.push(left);
  return rooms;
}

// Cost of ONE room for ONE night, in SAR.
// Sheet rates are per person, except "room" which is the full room price.
export function roomCostPerNight(season, size) {
  let value;
  if (size >= 4) value = season.quad * 4;
  else if (size === 3) value = season.triple * 3;
  else if (size === 2) value = season.double * 2;
  else value = season.room;

  if (!Number.isFinite(value)) {
    throw new Error("Missing rate for this room type.");
  }
  return value;
}