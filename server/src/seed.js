import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "./db.js";
import Hotel from "./models/Hotel.js";

const A = { start: new Date("2026-11-01"), end: new Date("2026-12-09") };
const B = { start: new Date("2026-12-10"), end: new Date("2027-01-31") };

const hotels = [
  {
    city: "makkah",
    name: "Shaza Al Wasam-2",
    distanceM: 600,
    seasons: [
      { ...A, share: 32, quad: 40, triple: 54, double: 80, room: 160 },
      { ...B, share: 44, quad: 55, triple: 74, double: 110, room: 220 },
    ],
  },
  {
    city: "madinah",
    name: "Marina Zahbi",
    distanceM: 700,
    seasons: [
      { ...A, share: 35, quad: 44, triple: 59, double: 88, room: 175 },
      { ...B, share: 45, quad: 57, triple: 75, double: 113, room: 225 },
    ],
  },
];

await connectDb();
await Hotel.deleteMany({});
await Hotel.insertMany(hotels);
console.log("Seeded", hotels.length, "hotels");
await mongoose.disconnect();