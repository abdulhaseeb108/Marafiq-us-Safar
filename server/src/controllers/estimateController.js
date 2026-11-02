import PDFDocument from "pdfkit";
import { DATABASE_UNAVAILABLE_MESSAGE } from "../services/databaseMode.js";
import { prepareEstimate, saveSnapshot } from "../services/estimateService.js";

export async function calculateEstimate(req, res) {
  try {
    const prepared = await prepareEstimate(req.body);
    if (prepared.error) return res.status(prepared.status).json({ error: prepared.error });

    const { result, offline } = prepared;
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
    if (req.body.preview) return res.json({ ...result, expiresAt });
    if (offline) return res.status(503).json({ error: DATABASE_UNAVAILABLE_MESSAGE });

    const snapshot = await saveSnapshot(req.body, result, expiresAt);
    return res.json({ ...result, snapshotId: snapshot._id, expiresAt });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
}

export async function createEstimatePdf(req, res) {
  try {
    const prepared = await prepareEstimate(req.body, {
      defaultRoute: "route1",
      infantError: "Infants cannot exceed adults.",
    });
    if (prepared.error) return res.status(prepared.status).json({ error: prepared.error });

    const {
      adults, children = 0, infants = 0, roomType, startDate, routeText,
      infantBed = "none", roomAllocations, makkahNights, madinahNights,
      ziyarat = [], referenceNo, departureCity,
    } = req.body;
    const { route, calculation, makkahHotel, madinahHotel } = prepared;
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
      .text(`Arrival: ${new Date(`${startDate}T00:00:00Z`).toLocaleDateString("en-GB", { timeZone: "UTC" })}`)
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
      doc.text(`Infant/child bed: ${infantBed === "required" ? "Required" : "Not required"}`);
    }
    doc.moveDown().fillColor("#0B302D").fontSize(14).text("Itinerary");
    doc.fillColor("#263633").fontSize(11);
    for (const stay of orderedStays) {
      doc.text(`${stay.city}: ${stay.hotel} - ${stay.nights} night(s)`);
    }
    doc.moveDown().fillColor("#0B302D").fontSize(14).text("Cost breakdown");
    doc.fillColor("#263633").fontSize(11);
    for (const item of calculation.lineItems) {
      doc.text(`${item.label}: PKR ${fmt(Math.round(item.sar * calculation.fxSarToPkr))} (SAR ${fmt(item.sar)})`);
    }
    if (Array.isArray(ziyarat) && ziyarat.length) doc.text(`Ziyarat: ${ziyarat.join(", ")} (price on request)`);
    doc.moveDown().fillColor("#0B302D").fontSize(15)
      .text(`Estimated total: PKR ${fmt(calculation.totalPkr)} - ${fmt(calculation.highPkr)}`)
      .fontSize(11).text(`SAR ${fmt(calculation.totalSar)} - ${fmt(calculation.highSar)}`)
      .fontSize(10).fillColor("#52645F")
      .text("Estimate only, not a booking or guaranteed price. Final prices and availability are confirmed by our team in writing.");
    doc.end();
  } catch (error) {
    console.error(error);
    if (res.headersSent) return res.destroy(error);
    return res.status(400).json({ error: error.message });
  }
}
