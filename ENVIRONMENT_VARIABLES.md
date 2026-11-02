# Environment variables

Do not commit credentials. The server loads dotenv configuration from its process working directory; run the npm scripts from `server/` so `server/.env` is found. The client variable is embedded at build time and must never contain a secret.

| Variable | Used by | Required/default | Purpose |
|---|---|---|---|
| `MONGODB_URI` | Server | Required for MongoDB connection | Mongoose connection URI. Missing configuration is reported by the database connection helper. |
| `PORT` | Server | Defaults to `4000` | HTTP listen port. |
| `NODE_ENV` | Server | No explicit default | `production` disables bundled offline hotel data and makes readiness depend on MongoDB. Other values use the development fallback when disconnected. |
| `CLIENT_ORIGINS` | Server | In development defaults to localhost Vite origins; in production defaults to none | Exact allowed browser origins, comma-separated. Configure production origins explicitly. |
| `TRUST_PROXY` | Server | Defaults to disabled | Set to the literal `true` only when deployed behind a trusted single reverse proxy; affects Express client-IP handling for rate limits. |
| `VITE_API_URL` | Client build | Defaults to same-origin requests | Optional API origin. The Vite dev server proxies `/api` to `http://localhost:4000`. |

`CLIENT_ORIGINS` and `TRUST_PROXY` are operational settings, not authentication controls. No WhatsApp, Google Cloud Vision, or Gemini credentials are currently used.
