import Snapshot from "../models/Snapshot.js";
import { calculate } from "../engine/calculate.js";
import { validRoomAllocation } from "../engine/rooms.js";
import { getNightlySeasons } from "../engine/seasons.js";
import {
  isCalendarDate, isSupportedEstimateRoute, validStayNights, validTravelerCounts,
} from "../engine/validation.js";
import {
  DATABASE_UNAVAILABLE_MESSAGE, findHotelById, isDatabaseConnected, useOfflineHotels,
} from "./databaseMode.js";

const validationError = (error, status = 400) => ({ status, error });

export async function prepareEstimate(input, {
  defaultRoute,
  infantError = "Each infant needs an adult. Infants cannot exceed adults.",
} = {}) {
  const {
    adults, children = 0, infants = 0, roomType, roomAllocations,
    startDate, makkahHotelId, madinahHotelId, makkahNights, madinahNights,
  } = input;
  const route = input.route === undefined ? defaultRoute : input.route;

  if (!validTravelerCounts({ adults, children, infants })) {
    return validationError("Enter 1–30 adults, 0–30 children, and no more infants than adults.");
  }
  if (!validStayNights({ makkahNights, madinahNights })) {
    return validationError("Each hotel stay must be between 1 and 60 nights.");
  }
  if (!isCalendarDate(startDate) || !makkahHotelId || !madinahHotelId) {
    return validationError("Enter a valid arrival date and select both hotels.");
  }
  if (!isSupportedEstimateRoute(route)) {
    return validationError(
      "This itinerary requires a confirmed quote; online estimates are available for Routes 1 and 2 only.",
      422
    );
  }
  if (![1, 2, 3, 4, "sharing"].includes(roomType)) {
    return validationError("Select a supported room type.");
  }
  if (infants > adults) return validationError(infantError);
  if (infants > 0 && input.infantBed === "required") {
    return validationError("Infant bed rates are not available online. Request a confirmed quote.");
  }

  const hotelOccupants = adults + children;
  if (roomAllocations !== undefined && roomType !== "sharing" &&
    !validRoomAllocation(roomAllocations, hotelOccupants)) {
    return validationError("Room allocation must provide one bed for every adult and child.");
  }

  const offline = useOfflineHotels();
  if (!offline && !isDatabaseConnected()) {
    return validationError(DATABASE_UNAVAILABLE_MESSAGE, 503);
  }

  const makkahHotel = await findHotelById(makkahHotelId, offline);
  const madinahHotel = await findHotelById(madinahHotelId, offline);
  if (!makkahHotel || !madinahHotel) return validationError("Hotel not found.");

  const firstCity = route === "route2" || route === "madinah-makkah" ? "madinah" : "makkah";
  const firstNights = firstCity === "makkah" ? makkahNights : madinahNights;
  const secondCityStart = new Date(`${startDate}T00:00:00Z`);
  secondCityStart.setUTCDate(secondCityStart.getUTCDate() + firstNights);
  const secondCityDate = secondCityStart.toISOString().slice(0, 10);
  const makkahSeasons = getNightlySeasons(
    makkahHotel, firstCity === "makkah" ? startDate : secondCityDate, makkahNights
  );
  const madinahSeasons = getNightlySeasons(
    madinahHotel, firstCity === "madinah" ? startDate : secondCityDate, madinahNights
  );
  const calculation = calculate({
    adults, children, infants, roomType, roomAllocations, makkahSeasons, madinahSeasons,
  });
  const result = {
    ...calculation,
    totalNights: makkahNights + madinahNights,
    stays: [
      {
        city: "makkah", hotel: makkahHotel.name, nights: makkahNights,
        detail: "Total for stay", sar: calculation.lineItems[1].sar,
      },
      {
        city: "madinah", hotel: madinahHotel.name, nights: madinahNights,
        detail: "Total for stay", sar: calculation.lineItems[2].sar,
      },
    ],
    ziyarat: Array.isArray(input.ziyarat) ? input.ziyarat : [],
    pending: [],
  };

  return { result, calculation, makkahHotel, madinahHotel, route, offline };
}

export async function saveSnapshot(inputs, result, expiresAt) {
  return Snapshot.create({ inputs, result, expiresAt });
}
