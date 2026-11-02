import { isDatabaseConnected } from "../services/databaseMode.js";

export function health(_req, res) {
  res.json({ status: "ok" });
}

export function readiness(_req, res) {
  const connected = isDatabaseConnected();
  const ready = connected || process.env.NODE_ENV !== "production";
  res.status(ready ? 200 : 503).json({
    status: ready ? "ready" : "not_ready",
    database: connected ? "connected" : "disconnected",
  });
}
