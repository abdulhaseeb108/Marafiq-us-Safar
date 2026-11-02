import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "../config/database.js";
import Hotel from "../models/Hotel.js";
import { hotels } from "../data/hotels.js";

await connectDb();
const FORCE = process.argv.includes("--force");

if (process.env.NODE_ENV === "production") {
  console.error("REFUSED: seed is disabled when NODE_ENV=production.");
  process.exit(1);
}

const existing = await Hotel.countDocuments();
console.log(`The Hotel collection currently has ${existing} hotels.`);

if (existing > 0 && !FORCE) {
  console.error(
    "REFUSED: seeding would DELETE all existing hotels and their prices.\n" +
    "If you really want that, run:  npm run seed -- --force"
  );
  await mongoose.disconnect();
  process.exit(1);
}
await Hotel.deleteMany({});
await Hotel.insertMany(hotels);
console.log("Seeded", hotels.length, "hotels");
await mongoose.disconnect();
