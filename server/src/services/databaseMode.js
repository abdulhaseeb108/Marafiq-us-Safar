import mongoose from "mongoose";
import Hotel from "../models/Hotel.js";
import { hotels as bundledHotels } from "../data/hotels.js";

export const isDatabaseConnected = () => mongoose.connection.readyState === 1;
export const useOfflineHotels = () => process.env.NODE_ENV !== "production" && !isDatabaseConnected();

export const offlineHotels = bundledHotels.map((hotel, index) => ({
  ...hotel,
  _id: new mongoose.Types.ObjectId(index.toString(16).padStart(24, "0")),
  active: true,
}));

export async function findHotels(filter, offline = useOfflineHotels()) {
  return offline
    ? offlineHotels.filter((hotel) => hotel.active && (!filter.city || hotel.city === filter.city))
    : Hotel.find(filter);
}

export async function findHotelById(id, offline = useOfflineHotels()) {
  return offline
    ? offlineHotels.find((hotel) => String(hotel._id) === String(id))
    : Hotel.findById(id);
}

export const DATABASE_UNAVAILABLE_MESSAGE =
  "Database unavailable. Check the MongoDB connection and try again.";
