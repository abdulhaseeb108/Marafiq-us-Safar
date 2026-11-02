# API documentation

All endpoints are mounted under `/api`. JSON request bodies are limited to 32 KB. The API has an in-memory per-IP limit of 120 requests per minute. CORS origins are controlled by `CLIENT_ORIGINS`; CORS is not authentication.

## Health

### `GET /api/health`

Returns `200` with:

```json
{ "status": "ok" }
```

### `GET /api/ready`

Returns `200` when the service is ready or `503` when production MongoDB is disconnected.

```json
{ "status": "ready", "database": "connected" }
```

## Hotels

### `GET /api/hotels?city=makkah&date=2026-11-10`

- `city` is optional; when supplied it must be `makkah` or `madinah`.
- `date` is optional and defaults to `2026-11-10`; it must be a real `YYYY-MM-DD` date.
- Returns an array. Hotel records include the existing ID/name/location fields, `pricingStyle`, and `fxSarToPkr`. Depending on rate availability, a record may contain `rates` and `ratesPkr`, `onRequest: true`, or `noRate: true`.
- Rate values include the current service/payment markup. In non-production without MongoDB, the same endpoint reads from the bundled catalog.

Invalid city/date returns `400`; production database unavailability returns `503`.

## Estimates and PDF

### `POST /api/calculate`

Accepts JSON with the calculator inputs, including:

```json
{
  "adults": 2,
  "children": 0,
  "infants": 0,
  "roomType": "sharing",
  "startDate": "2026-10-06",
  "route": "route1",
  "makkahNights": 4,
  "madinahNights": 3,
  "makkahHotelId": "hotel-id",
  "madinahHotelId": "hotel-id",
  "preview": true
}
```

Room types supported for online estimates are `1`, `2`, `3`, `4`, and `"sharing"`; custom room allocations can be supplied for non-sharing rooms. `route` must be a supported estimate route (`route1` or `route2`). Infants cannot exceed adults; infant-bed requests and unsupported itineraries require a quote.

The JSON result retains the existing calculation fields (`pkg`, `lineItems`, `hotelNightly`, totals in SAR/PKR, rooms, assumptions) plus `totalNights`, `stays`, `ziyarat`, `pending`, and `expiresAt`. With `preview: true`, it does not persist a snapshot. Without preview, it creates a Snapshot and adds `snapshotId`; persistence requires MongoDB.

### `POST /api/estimate-pdf`

Accepts the estimate inputs plus optional `routeText`, `departureCity`, `referenceNo`, `infantBed`, and `ziyarat`. Returns an `application/pdf` attachment named `umrah-estimate.pdf`. The route defaults to `route1` if omitted. It recalculates from the submitted inputs and does not create a Snapshot.

Validation errors retain the current `{ "error": "..." }` JSON shape. Unsupported estimate routes return `422`.

## Customer requests

### `POST /api/leads`

Requires `snapshotId`, `name`, `phone`, and `consent: true`; `note` is optional. The snapshot must exist in MongoDB. A successful response is:

```json
{ "referenceNo": "MUS-YYMM-0001", "duplicate": false }
```

Repeat lead submissions for one snapshot return its existing reference with `duplicate: true`.

### `POST /api/enquiries`

Accepts a custom-trip enquiry with contact/consent, destination and trip details. Traveler, route, room allocation, night, and list-length constraints are validated server-side. The successful response uses the same reference response shape, with the `TRP` prefix. A repeat enquiry from the same phone/destination within ten minutes returns the existing reference.

Lead/enquiry persistence requires MongoDB. There is no authentication or admin endpoint in this project.
