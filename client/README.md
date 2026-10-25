# Marafiq us Safar client

The client is a React single-page application using React Router for shareable URLs and browser history.

## Routes

| URL | Page |
| --- | --- |
| `/` | Home |
| `/umrah` | Umrah packages |
| `/umrah/package-calculator` | Six-step Umrah package calculator |
| `/hajj` | Hajj enquiry |
| `/tours` | Guided tours enquiry |
| `/flights` | Flight enquiry |
| `/visa` | Visa assistance enquiry |

Hajj, tours, flights, and visa have distinct routes and service-specific page content, while sharing the reusable enquiry form.

## Umrah calculator pricing behavior

- The calculator steps are travel details, Makkah hotel, Madinah hotel, route, transport and ziyarat, then summary.
- Route selection is required and starts unselected. The available choices are Route 1, Route 2, and Custom Route; hotel dates initially use Route 1 as a provisional schedule until a route is chosen.
- Arrival dates are selected from an accessible calendar limited to the supplier-rate window, October 6, 2026 through January 31, 2027.
- Price estimates are shown primarily in PKR, with SAR values in smaller secondary text.
- Children are included in package pricing and room allocations. When infants or children are added, one shared mattress preference applies to them all.
- More than two children requires an additional room; the calculator allocates at least two rooms and tells the traveler that the final arrangement and price will be confirmed by the team.
- Departure city is optional and can be selected from the searchable Pakistan city list.
- When infants or children are included, a shared mattress preference must be chosen before continuing; no option is preselected.
- Manual room allocations use the existing Private/Double/Triple/Quad supplier rates. Quint remains quote-only until supplier rates are added.
- Infants without a separate bed retain the existing infant pricing. A requested infant bed is quote-only until its rate is supplied.
- Custom itineraries and routes with return visits are submitted for a confirmed quote because the current rate data does not define visit-by-visit hotel nights. Route 1 prices Madinah first, then Makkah, using the existing city rates.

## Development

Run `npm install`, then `npm run dev` to start the Vite client. Use `npm run lint` and `npm run build` to validate changes.

The production web host must serve `index.html` as the fallback for client-side routes (for example, `/umrah/package-calculator`) while preserving API route handling. Vite's development server provides this fallback automatically.

The client uses same-origin `/api` requests by default. The Vite development server proxies `/api` to `http://localhost:4000`. For a separately hosted API, set `VITE_API_URL` to its origin (for example, `https://api.example.com`) when building the client and set the server's `CLIENT_ORIGINS` to the exact client origin or comma-separated origins. When running behind a trusted reverse proxy, set `TRUST_PROXY=true` so API rate limits use the originating client IP.

The API limits requests to 120 per IP per minute and bounds JSON request bodies to 32 KB. Configure the production origins and proxy settings for the actual deployment; CORS is not an authentication mechanism.
