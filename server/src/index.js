import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDb } from "./db.js";
import Hotel from "./models/Hotel.js";
import Snapshot from "./models/Snapshot.js";
import { calculate } from "./engine/calculate.js";
import { getNightlySeasons } from "./engine/seasons.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/hotels", async (req, res) => {
  const hotels = await Hotel.find({ active: true }).select("city name distanceM");
  res.json(hotels);
});

app.post("/api/calculate", async (req, res) => {
  try {
    const {
      adults, children = 0, infants = 0, roomType = 4,
      startDate, makkahHotelId, madinahHotelId, makkahNights, madinahNights,
    } = req.body;

    const counts = [adults, children, infants, makkahNights, madinahNights];
    const countsOk = counts.every((n) => Number.isInteger(n) && n >= 0);

    if (!countsOk || adults < 1 || !startDate || !makkahHotelId || !madinahHotelId) {
      return res.status(400).json({ error: "Please fill all fields. Adults must be at least 1." });
    }
    if (![2, 3, 4].includes(roomType)) {
      return res.status(400).json({ error: "Room type must be 2, 3 or 4 per room." });
    }
    if (infants > adults) {
      return res.status(400).json({ error: "Each infant needs an adult. Infants cannot exceed adults." });
    }

    const makkahHotel = await Hotel.findById(makkahHotelId);
    const madinahHotel = await Hotel.findById(madinahHotelId);
    if (!makkahHotel || !madinahHotel) {
      return res.status(400).json({ error: "Hotel not found." });
    }

    // Assume Makkah first, then Madinah
    const makkahSeasons = getNightlySeasons(makkahHotel, startDate, makkahNights);
    const madinahStart = new Date(startDate + "T00:00:00Z");
    madinahStart.setUTCDate(madinahStart.getUTCDate() + makkahNights);
    const madinahSeasons = getNightlySeasons(
      madinahHotel,
      madinahStart.toISOString().slice(0, 10),
      madinahNights
    );

    const result = calculate({
      adults, children, infants, roomType, makkahSeasons, madinahSeasons,
    });

    const snapshot = await Snapshot.create({
      inputs: req.body,
      result,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
    });

    res.json({ ...result, snapshotId: snapshot._id, expiresAt: snapshot.expiresAt });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

const PORT = 4000;
await connectDb();
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});