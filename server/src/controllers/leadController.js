import Snapshot from "../models/Snapshot.js";
import Lead from "../models/Lead.js";
import {
  DATABASE_UNAVAILABLE_MESSAGE, isDatabaseConnected,
} from "../services/databaseMode.js";
import { nextReference } from "../services/referenceService.js";
import { PHONE } from "../validators/contact.js";

export async function createLead(req, res) {
  if (!isDatabaseConnected()) {
    return res.status(503).json({ error: DATABASE_UNAVAILABLE_MESSAGE });
  }
  try {
    const { snapshotId, name, phone, note, consent } = req.body;
    if (!snapshotId || !name?.trim() || !phone?.trim()) {
      return res.status(400).json({ error: "Name and phone are required." });
    }
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
    return res.json({ referenceNo: lead.referenceNo, duplicate: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not save your request. Please try again." });
  }
}
