import express from "express";
import cors from "cors";
import rateLimiter from "./middleware/rateLimiter.js";
import apiRoutes from "./routes/index.js";

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
app.use("/api", rateLimiter, apiRoutes);

export default app;
