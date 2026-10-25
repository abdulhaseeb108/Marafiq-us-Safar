import "dotenv/config";
import express from "express";
import cors from "cors";
import PDFDocument from "pdfkit";
import mongoose from "mongoose";
import { connectDb } from "./db.js";
import { hotels as bundledHotels } from "./seed.js";
import Hotel from "./models/Hotel.js";
import Snapshot from "./models/Snapshot.js";
import Lead from "./models/Lead.js";
import Counter from "./models/Counter.js";
import Enquiry from "./models/Enquiry.js";
import { calculate } from "./engine/calculate.js";
import { validRoomAllocation } from "./engine/rooms.js";
import { getNightlySeasons } from "./engine/seasons.js";
import { RULES } from "./engine/rules.js";
import { ROUTE_SEGMENTS } from "./engine/routes.js";
import {
  isCalendarDate, isKnownRoute, isSupportedEstimateRoute, validStayNights, validTravelerCounts,
} from "./engine/validation.js";

const app = express();
if (process.env.TRUST_PROXY === "true") app.set("trust proxy", 1);
const configuredOrigins = (process.env.CLIENT_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const allowedOrigins = new Set(configuredOrigins.length
  ? configuredOrigins
  : process.env.NODE_ENV === "production"
    ? []
    : ["http://localhost:5173", "http://127.0.0.1:5173"]);
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.has(origin));
  },
  maxAge: 600,
}));
app.use(express.json({ limit: "32kb" }));

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 120;
const RATE_LIMIT_MAX_IPS = 10_000;
const rateLimitByIp = new Map();
let rateLimitChecks = 0;

app.use("/api", (req, res, next) => {
  const now = Date.now();
  if (++rateLimitChecks % 100 === 0) {
    for (const [ip, entry] of rateLimitByIp) {
      if (entry.resetAt <= now) rateLimitByIp.delete(ip);
    }
  }

  const ip = req.ip || req.socket.remoteAddress || "unknown";
  let entry = rateLimitByIp.get(ip);
  if (!entry || entry.resetAt <= now) {
    if (!entry && rateLimitByIp.size >= RATE_LIMIT_MAX_IPS) {
      return res.status(503).json({ error: "The request limiter is busy. Please try again shortly." });
    }
    entry = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitByIp.set(ip, entry);
  }

  res.setHeader("RateLimit-Limit", RATE_LIMIT_MAX);
  res.setHeader("RateLimit-Remaining", Math.max(0, RATE_LIMIT_MAX - entry.count - 1));
  res.setHeader("RateLimit-Reset", Math.ceil(entry.resetAt / 1000));
  if (entry.count >= RATE_LIMIT_MAX) {
    res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
    return res.status(429).json({ error: "Too many requests. Please wait a moment and try again." });
  }

  entry.count += 1;
  return next();
});

const isDatabaseConnected = () => mongoose.connection.readyState === 1;
const offlineHotels = bundledHotels.map((hotel, index) => ({
  ...hotel,
  _id: new mongoose.Types.ObjectId(index.toString(16).padStart(24, "0")),
  active: true,
}));
const useOfflineHotels = () => process.env.NODE_ENV !== "production" && !isDatabaseConnected();
const databaseUnavailable = (res) =>
  res.status(503).json({ error: "Database unavailable. Check the MongoDB connection and try again." });

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/api/ready", (req, res) => {
  const ready = isDatabaseConnected() || process.env.NODE_ENV !== "production";
  res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not_ready",
    database: isDatabaseConnected() ? "connected" : "disconnected",
  });
});

// Hotels with an indicative price (our fees included) for one date
app.get("/api/hotels", async (req, res) => {
  try {
    const city = req.query.city;
    const date = req.query.date || "2026-11-10";
    if (city && !["makkah", "madinah"].includes(city)) {
      return res.status(400).json({ error: "Select a supported hotel city." });
    }
    if (!isCalendarDate(date)) return res.status(400).json({ error: "Enter a valid calendar date." });
    const day = new Date(`${date}T00:00:00Z`);

    const filter = { active: true, ...(city ? { city } : {}) };
    const offline = useOfflineHotels();
    if (!offline && !isDatabaseConnected()) return databaseUnavailable(res);
    const availableHotels = offline
      ? offlineHotels.filter((hotel) => hotel.active && (!city || hotel.city === city))
      : await Hotel.find(filter);
    const markup = (1 + RULES.serviceChargePct / 100) * (1 + RULES.paymentCostPct / 100);
    const fxSarToPkr = RULES.fxSarToPkr * (1 + RULES.fxBufferPct / 100);

    res.json(availableHotels.map((h) => {
      const base = {
        _id: h._id, city: h.city, name: h.name, oldName: h.oldName, area: h.area,
        distanceM: h.distanceM, distanceText: h.distanceText, category: h.category,
        shuttle: h.shuttle, pricingStyle: h.pricingStyle, notes: h.notes, fxSarToPkr,
      };
      if (h.pricingStyle === "on_request") return { ...base, onRequest: true };
      const s = h.seasons.find((x) => day >= x.start && day <= x.end);
      if (!s || (h.availableFrom && day < h.availableFrom)) return { ...base, noRate: true };
      const rates = Object.fromEntries(
        ["share", "quad", "triple", "double", "room"].map((key) => [
          key,
          s[key] == null ? null : Math.round(s[key] * markup),
        ])
      );
      const ratesPkr = Object.fromEntries(
        Object.entries(rates).map(([key, value]) => [
          key,
          value == null ? null : Math.round(value * fxSarToPkr),
        ])
      );
      return {
        ...base,
        rates,
        ratesPkr,
        perPersonQuad: rates.quad,
        perRoom: rates.room,
      };
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load hotels." });
  }
});

app.post("/api/calculate", async (req, res) => {
  try {
    const {
      adults, children = 0, infants = 0, roomType, roomAllocations,
      startDate, makkahHotelId, madinahHotelId, makkahNights, madinahNights,
    } = req.body;

    if (!validTravelerCounts({ adults, children, infants })) {
      return res.status(400).json({ error: "Enter 1–30 adults, 0–30 children, and no more infants than adults." });
    }
    if (!validStayNights({ makkahNights, madinahNights })) {
      return res.status(400).json({ error: "Each hotel stay must be between 1 and 60 nights." });
    }
    if (!isCalendarDate(startDate) || !makkahHotelId || !madinahHotelId) {
      return res.status(400).json({ error: "Enter a valid arrival date and select both hotels." });
    }
    if (!isSupportedEstimateRoute(req.body.route)) {
      return res.status(422).json({ error: "This itinerary requires a confirmed quote; online estimates are available for Routes 1 and 2 only." });
    }
    if (![1, 2, 3, 4, "sharing"].includes(roomType)) {
      return res.status(400).json({ error: "Select a supported room type." });
    }
    if (infants > adults) {
      return res.status(400).json({ error: "Each infant needs an adult. Infants cannot exceed adults." });
    }
    if (infants > 0 && req.body.infantBed === "required") {
      return res.status(400).json({ error: "Infant bed rates are not available online. Request a confirmed quote." });
    }
    const hotelOccupants = adults + children;
    if (roomAllocations !== undefined && roomType !== "sharing" && !validRoomAllocation(roomAllocations, hotelOccupants)) {
      return res.status(400).json({ error: "Room allocation must provide one bed for every adult and child." });
    }

    const offline = useOfflineHotels();
    if (!offline && !isDatabaseConnected()) return databaseUnavailable(res);
    const findHotel = (id) => offline
      ? offlineHotels.find((hotel) => String(hotel._id) === String(id))
      : Hotel.findById(id);
    const makkahHotel = await findHotel(makkahHotelId);
    const madinahHotel = await findHotel(madinahHotelId);
    if (!makkahHotel || !madinahHotel) return res.status(400).json({ error: "Hotel not found." });

    const firstCity = req.body.route === "route2" || req.body.route === "madinah-makkah" ? "madinah" : "makkah";
    const firstNights = firstCity === "makkah" ? makkahNights : madinahNights;
    const secondCityStart = new Date(startDate + "T00:00:00Z");
    secondCityStart.setUTCDate(secondCityStart.getUTCDate() + firstNights);
    const secondCityDate = secondCityStart.toISOString().slice(0, 10);
    const makkahSeasons = getNightlySeasons(makkahHotel, firstCity === "makkah" ? startDate : secondCityDate, makkahNights);
    const madinahSeasons = getNightlySeasons(madinahHotel, firstCity === "madinah" ? startDate : secondCityDate, madinahNights);

    const calculated = calculate({ adults, children, infants, roomType, roomAllocations, makkahSeasons, madinahSeasons });
    const result = {
      ...calculated,
      totalNights: makkahNights + madinahNights,
      stays: [
        { city: "makkah", hotel: makkahHotel.name, nights: makkahNights, detail: "Total for stay", sar: calculated.lineItems[1].sar },
        { city: "madinah", hotel: madinahHotel.name, nights: madinahNights, detail: "Total for stay", sar: calculated.lineItems[2].sar },
      ],
      ziyarat: Array.isArray(req.body.ziyarat) ? req.body.ziyarat : [],
      pending: [],
    };
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);

    if (req.body.preview) return res.json({ ...result, expiresAt }); // not saved

    if (offline) return databaseUnavailable(res);
    const snapshot = await Snapshot.create({ inputs: req.body, result, expiresAt });
    res.json({ ...result, snapshotId: snapshot._id, expiresAt });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/estimate-pdf", async (req, res) => {
  try {
    const {
      adults, children = 0, infants = 0, roomType, startDate,
      route = "route1", routeText, customRoute, infantBed = "none", roomAllocations,
      makkahHotelId, madinahHotelId, makkahNights, madinahNights, ziyarat = [], referenceNo, departureCity,
    } = req.body;
    if (!validTravelerCounts({ adults, children, infants })) {
      return res.status(400).json({ error: "Enter 1–30 adults, 0–30 children, and no more infants than adults." });
    }
    if (!validStayNights({ makkahNights, madinahNights })) {
      return res.status(400).json({ error: "Each hotel stay must be between 1 and 60 nights." });
    }
    if (!isCalendarDate(startDate) || !makkahHotelId || !madinahHotelId) {
      return res.status(400).json({ error: "Enter a valid arrival date and select both hotels." });
    }
    if (!isSupportedEstimateRoute(route)) {
      return res.status(422).json({ error: "This itinerary requires a confirmed quote; online estimates are available for Routes 1 and 2 only." });
    }
    if (![1, 2, 3, 4, "sharing"].includes(roomType)) {
      return res.status(400).json({ error: "Select a supported room type." });
    }
    if (infants > adults) return res.status(400).json({ error: "Infants cannot exceed adults." });
    if (infants > 0 && infantBed === "required") {
      return res.status(400).json({ error: "Infant bed rates are not available online. Request a confirmed quote." });
    }
    const hotelOccupants = adults + children;
    if (roomAllocations !== undefined && roomType !== "sharing" && !validRoomAllocation(roomAllocations, hotelOccupants)) {
      return res.status(400).json({ error: "Room allocation must provide one bed for every adult and child." });
    }

    const offline = useOfflineHotels();
    if (!offline && !isDatabaseConnected()) return databaseUnavailable(res);
    const findHotel = (id) => offline
      ? offlineHotels.find((hotel) => String(hotel._id) === String(id))
      : Hotel.findById(id);
    const makkahHotel = await findHotel(makkahHotelId);
    const madinahHotel = await findHotel(madinahHotelId);
    if (!makkahHotel || !madinahHotel) return res.status(400).json({ error: "Hotel not found." });

    const firstCity = route === "route2" || route === "madinah-makkah" ? "madinah" : "makkah";
    const firstNights = firstCity === "makkah" ? makkahNights : madinahNights;
    const secondCityStart = new Date(startDate + "T00:00:00Z");
    secondCityStart.setUTCDate(secondCityStart.getUTCDate() + firstNights);
    const secondCityDate = secondCityStart.toISOString().slice(0, 10);
    const makkahSeasons = getNightlySeasons(makkahHotel, firstCity === "makkah" ? startDate : secondCityDate, makkahNights);
    const madinahSeasons = getNightlySeasons(madinahHotel, firstCity === "madinah" ? startDate : secondCityDate, madinahNights);
    const result = calculate({ adults, children, infants, roomType, roomAllocations, makkahSeasons, madinahSeasons });
    const fmt = (amount) => Number(amount).toLocaleString("en-US");
    const itineraryText = routeText || (route === "route2" || route === "madinah-makkah"
      ? "Jeddah → Madinah → Makkah → Jeddah"
      : "Jeddah → Makkah → Madinah → Jeddah");
    const orderedStays = (route === "route2" || route === "madinah-makkah")
      ? [
        { city: "Madinah", hotel: madinahHotel.name, nights: madinahNights },
        { city: "Makkah", hotel: makkahHotel.name, nights: makkahNights },
      ]
      : [
        { city: "Makkah", hotel: makkahHotel.name, nights: makkahNights },
        { city: "Madinah", hotel: madinahHotel.name, nights: madinahNights },
      ];
    const doc = new PDFDocument({ size: "A4", margin: 48 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="umrah-estimate.pdf"');
    doc.pipe(res);
    doc.fillColor("#0B302D").fontSize(20).text("Marafiq us Safar");
    doc.fillColor("#7A5A24").fontSize(10).text("UMRAH TRAVEL ESTIMATE");
    doc.moveDown();
    if (referenceNo) doc.fillColor("#263633").fontSize(10).text(`Reference: ${referenceNo}`);
    doc.fillColor("#263633").fontSize(11)
      .text(`Travelers: ${adults} adult(s)${children ? `, ${children} child(ren)` : ""}${infants ? `, ${infants} infant(s)` : ""}`)
      .text(`Arrival: ${new Date(startDate + "T00:00:00Z").toLocaleDateString("en-GB", { timeZone: "UTC" })}`)
      .text(`Departing from: ${departureCity || "Not specified"}`)
      .text(`Route: ${itineraryText}`)
      .text(`Room type: ${{ 1: "Private", 2: "Double", 3: "Triple", 4: "Quad", sharing: "Sharing" }[roomType]}`);
    if (Array.isArray(roomAllocations) && roomAllocations.length) {
      doc.text(`Room allocation: ${roomAllocations.join(" + ")} guest(s) per room`);
    }
    if (children > 2) {
      doc.text("More than two children: an additional room is required; final room arrangement to be confirmed.");
    }
    if (children > 0 || infants > 0) {
      doc.text(`Infant/child mattress: ${infantBed === "required" ? "Required" : "Not required"}`);
    }
    doc.moveDown().fillColor("#0B302D").fontSize(14).text("Itinerary");
    doc.fillColor("#263633").fontSize(11);
    for (const stay of orderedStays) {
      doc.text(`${stay.city}: ${stay.hotel} - ${stay.nights} night(s)`);
    }
    doc.moveDown().fillColor("#0B302D").fontSize(14).text("Cost breakdown");
    doc.fillColor("#263633").fontSize(11);
    for (const item of result.lineItems) {
      doc.text(`${item.label}: PKR ${fmt(Math.round(item.sar * result.fxSarToPkr))} (SAR ${fmt(item.sar)})`);
    }
    if (Array.isArray(ziyarat) && ziyarat.length) doc.text(`Ziyarat: ${ziyarat.join(", ")} (price on request)`);
    doc.moveDown().fillColor("#0B302D").fontSize(15)
      .text(`Estimated total: PKR ${fmt(result.totalPkr)} - ${fmt(result.highPkr)}`)
      .fontSize(11).text(`SAR ${fmt(result.totalSar)} - ${fmt(result.highSar)}`)
      .fontSize(10).fillColor("#52645F")
      .text("Estimate only, not a booking or guaranteed price. Final prices and availability are confirmed by our team in writing.");
    doc.end();
  } catch (err) {
    console.error(err);
    if (res.headersSent) return res.destroy(err);
    res.status(400).json({ error: err.message });
  }
});

// Reference numbers: MUS-2610-0001 (Umrah), TRP-2610-0001 (other trips)
async function nextReference(prefix = "MUS") {
  const now = new Date();
  const yymm = String(now.getUTCFullYear()).slice(2) + String(now.getUTCMonth() + 1).padStart(2, "0");
  const counterId = prefix === "MUS" ? yymm : `${prefix}-${yymm}`;
  const counter = await Counter.findByIdAndUpdate(counterId, { $inc: { seq: 1 } }, { new: true, upsert: true });
  return `${prefix}-${yymm}-${String(counter.seq).padStart(4, "0")}`;
}

const PHONE = /^[+0-9\s-]{9,16}$/;
app.post("/api/leads", async (req, res) => {
  if (!isDatabaseConnected()) return databaseUnavailable(res);
  try {
    const { snapshotId, name, phone, note, consent } = req.body;
    if (!snapshotId || !name?.trim() || !phone?.trim()) return res.status(400).json({ error: "Name and phone are required." });
    if (consent !== true) return res.status(400).json({ error: "Please tick the consent box." });
    if (!PHONE.test(phone.trim())) return res.status(400).json({ error: "Please enter a valid phone number." });

    const snapshot = await Snapshot.findById(snapshotId);
    if (!snapshot) return res.status(400).json({ error: "Estimate not found. Please calculate again." });

    const existing = await Lead.findOne({ snapshotId });
    if (existing) return res.json({ referenceNo: existing.referenceNo, duplicate: true });

    const lead = await Lead.create({
      referenceNo: await nextReference("MUS"), snapshotId,
      name: name.trim(), phone: phone.trim(), note: note?.trim().slice(0, 500),
      consent: true, consentAt: new Date(),
    });
    console.log("NEW LEAD:", lead.referenceNo);
    res.json({ referenceNo: lead.referenceNo, duplicate: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save your request. Please try again." });
  }
});

// Any other destination: a request for a custom quote (no price shown)
app.post("/api/enquiries", async (req, res) => {
  if (!isDatabaseConnected()) return databaseUnavailable(res);
  try {
    const {
      name, phone, consent, destination, tripType, adults, children = 0, infants = 0,
      startDate, nights, departureCity, budgetPkr, services = [], needs = [], note,
      route, routeText, customRoute, routeSegments, transport, roomType, roomAllocations,
      makkahNights, madinahNights, ziyarat = [], infantBed,
    } = req.body;

    if (!name?.trim() || !phone?.trim() || !destination?.trim()) {
      return res.status(400).json({ error: "Name, phone and destination are required." });
    }
    if (consent !== true) return res.status(400).json({ error: "Please tick the consent box." });
    if (!PHONE.test(phone.trim())) return res.status(400).json({ error: "Please enter a valid phone number." });
    if (!validTravelerCounts({ adults, children, infants })) {
      return res.status(400).json({ error: "Please check the number of travellers." });
    }
    if (nights != null && (!Number.isInteger(nights) || nights < 1 || nights > 90)) {
      return res.status(400).json({ error: "Nights must be between 1 and 90." });
    }
    if (startDate && !isCalendarDate(startDate)) {
      return res.status(400).json({ error: "Enter a valid calendar date." });
    }
    if (route && !isKnownRoute(route)) return res.status(400).json({ error: "Select a supported itinerary." });
    if (transport && !["bus", "private", "partial"].includes(transport)) {
      return res.status(400).json({ error: "Select a supported transport option." });
    }
    if (routeSegments !== undefined && (!Array.isArray(routeSegments) ||
      routeSegments.length > 10 ||
      !routeSegments.every((segment) =>
        segment && ["makkah", "madinah"].includes(segment.city) &&
        Number.isInteger(segment.visit) && segment.visit >= 1 && segment.visit <= 10
      ))) {
      return res.status(400).json({ error: "The itinerary segments are invalid." });
    }
    if (infantBed !== undefined && !["required", "none"].includes(infantBed)) {
      return res.status(400).json({ error: "Select a supported infant bed preference." });
    }
    if (roomAllocations !== undefined &&
      (!Array.isArray(roomAllocations) ||
        !roomAllocations.every((size) => Number.isInteger(size) && size >= 1 && size <= 4) ||
        roomAllocations.length > adults + children)) {
      return res.status(400).json({ error: "The room allocation is invalid." });
    }
    if (Array.isArray(roomAllocations) && roomAllocations.length > 0 &&
      !validRoomAllocation(
        roomAllocations,
        adults + children + (infantBed === "required" ? infants : 0)
      )) {
      return res.status(400).json({ error: "Room allocation must match the guests who need beds." });
    }
    if (makkahNights !== undefined && madinahNights !== undefined &&
      !validStayNights({ makkahNights, madinahNights })) {
      return res.status(400).json({ error: "Each hotel stay must be between 1 and 60 nights." });
    }
    if ((makkahNights !== undefined) !== (madinahNights !== undefined) ||
      (makkahNights !== undefined && nights !== makkahNights + madinahNights)) {
      return res.status(400).json({ error: "Total nights must match the Makkah and Madinah stay totals." });
    }

    // Same person, same destination, last 10 minutes: return the existing request
    const recent = await Enquiry.findOne({
      phone: phone.trim(), destination: destination.trim(),
      createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) },
    });
    if (recent) return res.json({ referenceNo: recent.referenceNo, duplicate: true });

    const clean = (list) => (Array.isArray(list) ? list.slice(0, 10).map((s) => String(s).slice(0, 40)) : []);
    const enquiry = await Enquiry.create({
      referenceNo: await nextReference("TRP"),
      name: name.trim(), phone: phone.trim(), consent: true, consentAt: new Date(),
      destination: destination.trim().slice(0, 80), tripType: String(tripType || "").slice(0, 40),
      adults, children, infants, startDate: String(startDate || "").slice(0, 10), nights,
      departureCity: String(departureCity || "").trim().slice(0, 80),
      budgetPkr: String(budgetPkr || "").slice(0, 30),
      services: clean(services), needs: clean(needs), note: note?.trim().slice(0, 500),
      route, routeText: String(routeText || "").trim().slice(0, 300),
      customRoute: String(customRoute || "").trim().slice(0, 300),
      routeSegments: route && route !== "custom"
        ? ROUTE_SEGMENTS[route].map((city, index) => ({ city, visit: index + 1 }))
        : [],
      transport, roomType: roomType == null ? "" : String(roomType).slice(0, 20),
      roomAllocations: Array.isArray(roomAllocations) ? roomAllocations : [],
      makkahNights, madinahNights,
      ziyarat: clean(ziyarat), infantBed: infantBed === "required" ? "required" : "none",
    });
    console.log("NEW ENQUIRY:", enquiry.referenceNo);
    res.json({ referenceNo: enquiry.referenceNo, duplicate: false });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save your request. Please try again." });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
connectDb().catch((err) => {
  console.error("MongoDB connection failed. Development uses the bundled hotel catalog until MongoDB is available.", err);
});