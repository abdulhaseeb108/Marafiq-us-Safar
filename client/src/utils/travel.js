import { ROOM_NAME, ROUTES } from "../data/calculator.jsx";

export const fmt = (value) => Number(value).toLocaleString("en-US");
export const validDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};
export const addDaysStr = (value, days) => {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};
export const showDate = (value) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
export const plural = (count, word) =>
  `${count} ${word === "child" && count !== 1 ? "children" : `${word}${count === 1 ? "" : "s"}`}`;

export function planStays(form) {
  const order = [...new Set((ROUTES[form.route] || ROUTES.route2).order)];
  const stays = {};
  let cursor = form.startDate;

  for (const city of order) {
    const nights = form[`${city}Nights`];
    stays[city] = { checkIn: cursor, checkOut: addDaysStr(cursor, nights), nights };
    cursor = stays[city].checkOut;
  }

  return { order, stays, end: cursor };
}

export function allocateRoomBeds(
  guests,
  roomType,
  primaryRoomCount = 1,
  additionalRoomType = roomType,
  minimumRoomCount = 1
) {
  if (roomType === "sharing") return [];
  const primaryCapacity = Number(roomType);
  const additionalCapacity = Number(additionalRoomType);
  if (![1, 2, 3, 4].includes(primaryCapacity) || ![1, 2, 3, 4].includes(additionalCapacity)) return [];

  let remaining = guests;
  const rooms = [];
  const primaryCount = Math.max(1, Math.min(primaryRoomCount, Math.ceil(guests / primaryCapacity)));
  for (let index = 0; index < primaryCount && remaining > 0; index += 1) {
    const occupants = Math.min(primaryCapacity, remaining);
    rooms.push(occupants);
    remaining -= occupants;
  }
  while (remaining > 0) {
    const occupants = Math.min(additionalCapacity, remaining);
    rooms.push(occupants);
    remaining -= occupants;
  }
  while (rooms.length < minimumRoomCount) {
    const largestRoom = rooms.reduce((largestIndex, occupants, index) =>
      occupants > rooms[largestIndex] ? index : largestIndex, 0);
    if (rooms[largestRoom] < 2) break;
    const occupants = rooms[largestRoom];
    rooms.splice(largestRoom, 1, Math.ceil(occupants / 2), Math.floor(occupants / 2));
  }
  return rooms;
}

export function priceFor(hotel, roomType) {
  if (hotel.onRequest) return { text: "On booking", note: "Price on request", off: true };
  if (hotel.noRate) return { text: "No rate", note: "Rate not loaded for these dates", off: true };
  if (roomType === 5) return { text: "Rate on request", note: "Quint supplier rate has not been added" };
  if (hotel.pricingStyle === "room_only") {
    return {
      text: `PKR ${fmt(hotel.ratesPkr.room)}`,
      secondary: `SAR ${fmt(hotel.rates.room)}`,
      note: "per room / night",
    };
  }
  if (!roomType) return { text: "Select room type", note: "Choose a room type to view price", off: true };

  const key = roomType === "sharing" ? "share" : roomType === 1 ? "room" : roomType === 3 ? "triple" : roomType === 2 ? "double" : "quad";
  if (hotel.rates[key] == null) {
    return { text: "Not offered", note: `No ${ROOM_NAME[roomType].toLowerCase()} rate on supplier sheet`, off: true };
  }

  return {
    text: `PKR ${fmt(hotel.ratesPkr[key])}`,
    secondary: `SAR ${fmt(hotel.rates[key])}`,
    note: "per person / night",
  };
}
