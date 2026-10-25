// Split guests into rooms. preferred = 4, 3 or 2 guests per room.
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

export function validRoomAllocation(rooms, guests) {
  return Array.isArray(rooms) &&
    rooms.length > 0 &&
    rooms.every((size) => Number.isInteger(size) && size >= 1 && size <= 4) &&
    rooms.reduce((total, size) => total + size, 0) === guests;
}

export function need(value) {
  if (value == null || !Number.isFinite(value)) {
    throw new Error("This hotel has no supplier rate for the chosen room type. Choose another room type or hotel.");
  }
  return value;
}

// Cost of ONE room for ONE night, in SAR.
export function roomCostPerNight(season, size) {
  if (season.style === "room_only") return need(season.room); // flat room price
  if (size >= 4) return need(season.quad) * 4;
  if (size === 3) return need(season.triple) * 3;
  if (size === 2) return need(season.double) * 2;
  return need(season.room); // a guest alone pays the full room
}