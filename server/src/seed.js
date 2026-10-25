import "dotenv/config";
import mongoose from "mongoose";
import { connectDb } from "./db.js";
import Hotel from "./models/Hotel.js";
import { pathToFileURL } from "node:url";

// Source: Waqar-e-Madina Travels (WMT) rate sheets, 1448-H, effective 06 Oct 2026.
// Rate row = [share, quad, triple, double, room]  (SAR; per person per night, "room" = whole room)
const WINDOW = {
  oct: ["2026-10-06", "2026-10-31"],
  nov: ["2026-11-01", "2026-12-09"],
  dec: ["2026-12-10", "2027-01-31"],
};
const NA = null;
const flat = (n) => [NA, NA, NA, NA, n]; // room-basis price, same for any occupancy

function hotel(city, name, o) {
  const { oct, nov, dec, ...info } = o;
  const seasons = Object.entries({ oct, nov, dec })
    .filter(([, r]) => r)
    .map(([k, r]) => ({
      start: new Date(WINDOW[k][0]), end: new Date(WINDOW[k][1]),
      share: r[0], quad: r[1], triple: r[2], double: r[3], room: r[4],
    }));
  return { city, name, pricingStyle: "per_person", shuttle: false, seasons, ...info };
}
const mk = (n, o) => hotel("makkah", n, o);
const md = (n, o) => hotel("madinah", n, o);
const ROOM = { pricingStyle: "room_only" };
const ASK = { pricingStyle: "on_request" };

export const hotels = [
  // ---------------- MAKKAH ----------------
  mk("Qasr Al Sharq Tower", { area: "Shahra Mansoor", shuttle: true,
    oct: [6, 8, 10, 15, 30], nov: [8, 10, 14, 20, 40], dec: [18, 23, 30, 45, 90],
    notes: "Dec-Jan sheet lists this with Hiba Hijrah-6 as one row. Verify with WMT." }),
  mk("Hiba Hijrah-6", { area: "Shahra Mansoor", shuttle: true, category: "Economy Plus",
    oct: [14, 18, 24, 35, 70], nov: [16, 20, 27, 40, 80], dec: [18, 23, 30, 45, 90] }),
  mk("Qila Ajiyad", { area: "Shahra Ajiad", distanceM: 1100, category: "Economy Plus",
    oct: [16, 20, 27, 40, 80], nov: [18, 23, 30, 45, 90], dec: [26, 33, 44, 65, 130] }),
  mk("Diyar Mather", { area: "Shahra Ibrahim Khalil", distanceM: 1200, category: "Economy Plus",
    oct: [20, 25, 34, 50, 100], nov: [24, 30, 40, 60, 120], dec: [28, 35, 47, 70, 140] }),
  mk("Fundaq Bilal", { ...ROOM, area: "Shahra Ibrahim Khalil", shuttle: true,
    oct: flat(110), nov: flat(110), dec: flat(120),
    notes: "Flat room rate. Sheet says 'Quint bed'. Confirm room capacity." }),
  mk("Afwaj Al Momayaza / Shaza Wasam-3/4 / Wahdat Al Khair", { oldName: "Qased Al Khair",
    area: "Shahra Ajiad", distanceM: 650,
    oct: [26, 33, 44, 65, 130], nov: [28, 35, 47, 70, 140], dec: [40, 50, 67, 100, 200] }),
  mk("Shaza Al Wasam-2", { area: "Shahra Ajiad", distanceM: 600,
    oct: [30, 38, 50, 75, 150], nov: [32, 40, 54, 80, 160], dec: [44, 55, 74, 110, 220] }),
  mk("Swaed Al Khaima", { oldName: "Fawad Nassa", area: "Shahra Ibrahim Khalil, near Kabotar Chowk",
    distanceM: 500, distanceText: "400-500 m",
    oct: [45, 57, 75, 113, 225], nov: [50, 63, 84, 125, 250], dec: [55, 69, 92, 138, 275] }),
  mk("Badar Al Masa / Yasmin Al Majd", { area: "Shahra Ibrahim Khalil", distanceM: 600,
    oct: [57, 72, 95, 143, 285], nov: [60, 75, 100, 150, 300], dec: [76, 95, 127, 190, 380] }),
  mk("Akabir Hijrah / Areej Wafa / Mather Elite", { area: "Kabotar Chowk", distanceM: 300,
    oct: [NA, 82, 109, 163, 325], nov: [NA, 85, 114, 170, 340], dec: [NA, 100, 134, 200, 400],
    notes: "No shared-bed rate. Room basis only." }),
  mk("Al Kiswah Tower", { ...ROOM, category: "4-Star", area: "Shahra Al-Taysir", shuttle: true,
    oct: flat(100), nov: flat(130), dec: flat(170), notes: "Flat room rate." }),
  mk("Voco", { ...ASK, category: "4-Star", shuttle: true }),
  mk("Novotel Thakher", { ...ASK, category: "4-Star", area: "Ghaza bus station", shuttle: true }),
  mk("M Hotel Makkah by Millennium", { ...ASK, category: "5-Star", shuttle: true }),
  mk("M Millennium Dana", { ...ASK, shuttle: true }),
  mk("Four Points by Sheraton", { ...ASK, category: "5-Star", area: "Makkah Al Naseem", shuttle: true }),

  // ---------------- MADINAH ----------------
  md("Waqar Salmiya / Jood Marjan", { area: "Masjid Bilal side", shuttle: true,
    oct: [28, 35, 47, 70, 140], nov: [30, 38, 50, 75, 150], dec: [39, 49, 65, 98, 195] }),
  md("Waqar Rotana", { category: "Luxury", shuttle: true, availableFrom: new Date("2026-10-01"),
    oct: [32, 40, 54, 80, 160], nov: [32, 40, 54, 80, 160], dec: [41, 52, 69, 103, 205] }),
  md("Marina Zahbi", { area: "Walking distance", distanceM: 700,
    oct: [33, 42, 55, 83, 165], nov: [35, 44, 59, 88, 175], dec: [45, 57, 75, 113, 225] }),
  md("Waqar International", { area: "Masjid Bilal side", distanceM: 700,
    oct: [33, 42, 55, 83, 165], nov: [35, 44, 59, 88, 175], dec: [45, 57, 75, 113, 225] }),
  md("Ajiyal-2", { area: "Shumalia side", distanceM: 650,
    oct: [33, 42, 55, 83, 165], nov: [35, 44, 59, 88, 175], dec: [48, 60, 80, 120, 240] }),
  md("Nuzul Waqar", { area: "Masjid Bilal side", distanceM: 550,
    oct: [41, 52, 69, 103, 205], nov: [42, 53, 70, 105, 210], dec: [51, 64, 85, 128, 255] }),
  md("Nida Taiba", { area: "Masjid Bilal side", distanceM: 550,
    oct: [41, 52, 69, 103, 205], nov: [42, 53, 70, 105, 210], dec: [51, 64, 85, 128, 255] }),
  md("Shams Madinah", { area: "100 m after Al Baik Markazia", distanceM: 500,
    oct: [43, 54, 72, 108, 215], nov: [44, 55, 74, 110, 220], dec: [55, 69, 92, 138, 275] }),
  md("Ajiyal Taiba", { category: "Luxury", distanceM: 500,
    oct: [43, 54, 72, 108, 215], nov: [44, 55, 74, 110, 220], dec: [60, 75, 100, 150, 300] }),
  md("Retaj Rawdah", { category: "3-Star", area: "Shumalia side", distanceM: 550,
    oct: [45, 57, 75, 113, 225], nov: [50, 63, 84, 125, 250], dec: [65, 82, 109, 163, 325] }),
  md("Rua Al Khair / Burj Muktara", { oldName: "Amjad Al Saleem", area: "Bab Al Salam side", distanceM: 300,
    oct: [55, 69, 92, 138, 275], nov: [57, 72, 95, 143, 285], dec: [85, 107, 142, 213, 425] }),
  md("Any Hotel in Markazia", { area: "Markazia", distanceM: 300, distanceText: "250-300 m",
    oct: [60, 75, 100, 150, 300], nov: [64, 80, 107, 160, 320], dec: [100, 125, 167, 250, 500],
    notes: "Hotel assigned by supplier." }),
  md("Rua Luxury", { oldName: "Golden Luxury", area: "Markazia", distanceM: 50,
    oct: [70, 88, 117, 175, 350], nov: [70, 88, 117, 175, 350], dec: [130, 163, 217, 325, 650] }),
];

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  await connectDb();
  await Hotel.deleteMany({});
  await Hotel.insertMany(hotels);
  console.log("Seeded", hotels.length, "hotels");
  await mongoose.disconnect();
}