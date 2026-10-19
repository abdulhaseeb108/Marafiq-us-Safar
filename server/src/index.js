import express from "express";
import cors from "cors";
import { calculate } from "./engine/calculate.js";

const app = express();
app.use(cors());
app.use(express.json());

// Simple check that the server is alive
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// The calculator endpoint
app.post("/api/calculate", (req, res) => {
  const { adults, makkahNights, madinahNights, makkahRatePp, madinahRatePp } =
    req.body;

  // Basic validation: reject bad input instead of returning nonsense
  const numbers = [adults, makkahNights, madinahNights, makkahRatePp, madinahRatePp];
  const allValid = numbers.every((n) => Number.isFinite(n) && n >= 0);

  if (!allValid || adults < 1) {
    return res.status(400).json({
      error: "Please send valid numbers. adults must be at least 1.",
    });
  }

  const result = calculate({
    adults,
    makkahNights,
    madinahNights,
    makkahRatePp,
    madinahRatePp,
  });

  res.json(result);
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});