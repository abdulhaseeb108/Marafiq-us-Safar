import Enquiry from "../models/Enquiry.js";
import { validRoomAllocation } from "../engine/rooms.js";
import { ROUTE_SEGMENTS } from "../engine/routes.js";
import {
  isCalendarDate, isKnownRoute, validStayNights, validTravelerCounts,
} from "../engine/validation.js";
import { DATABASE_UNAVAILABLE_MESSAGE, isDatabaseConnected } from "../services/databaseMode.js";
import { nextReference } from "../services/referenceService.js";
import { PHONE } from "../validators/contact.js";

const clean = (list) => (Array.isArray(list) ? list.slice(0, 10).map((value) => String(value).slice(0, 40)) : []);

export async function createEnquiry(req, res) {
  if (!isDatabaseConnected()) {
    return res.status(503).json({ error: DATABASE_UNAVAILABLE_MESSAGE });
  }
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

    const recent = await Enquiry.findOne({
      phone: phone.trim(), destination: destination.trim(),
      createdAt: { $gt: new Date(Date.now() - 10 * 60 * 1000) },
    });
    if (recent) return res.json({ referenceNo: recent.referenceNo, duplicate: true });

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
    return res.json({ referenceNo: enquiry.referenceNo, duplicate: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not save your request. Please try again." });
  }
}
