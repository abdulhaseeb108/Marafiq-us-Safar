import { listHotels } from "../services/hotelService.js";

export async function getHotels(req, res) {
  try {
    const result = await listHotels(req.query.city, req.query.date || "2026-11-10");
    if (result.error) return res.status(result.status).json({ error: result.error });
    return res.json(result.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Could not load hotels." });
  }
}
