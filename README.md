# Marafiq ul Safar

Marafiq ul Safar is a React single-page travel site backed by an Express API and MongoDB. The currently available online journey is the six-step Umrah package calculator; other service routes display coming-soon pages. The API also retains the custom enquiry endpoint.

## Project layout

The client and server are separate npm projects with independent manifests and lockfiles. Install and run each from its own directory.

```powershell
Set-Location client
npm install
npm run dev
```

In another terminal:

```powershell
Set-Location server
npm install
npm run dev
```

Configure `server/.env` before relying on MongoDB-backed estimate snapshots, leads, enquiries, or the seed command. The development server can return the bundled hotel catalog when MongoDB is unavailable; this fallback is disabled in production.

See [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) for configuration and [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for the existing API contracts.

## Existing functionality

- Home page and client-side routes for Home, Umrah, Hajj, tours, flights, visa, and not-found.
- Six-step Umrah flow for passengers, departure airport, date, room occupancy/bed preference, Makkah and Madinah hotels, route, transport/ziyarat, live estimate and quote request.
- Server-side hotel seasonal rates, estimate calculation, snapshot creation, lead/enquiry capture, and PDF estimate generation.
- Existing routes and payloads are documented without introducing new endpoints.

The current source tree does not contain authentication or admin functionality. Customer lead and enquiry submissions are public routes. Do not treat CORS as authorization.

## Checks

```powershell
# client/
npm run lint
npm run build

# server/
npm test
```

The server API tests exercise health, hotel listing, a calculator preview, and PDF generation using the bundled development catalog; they do not require a MongoDB write.

## Database caution

`npm run seed` replaces the contents of the `Hotel` collection before inserting the bundled rate catalog. Run it only against a deliberately selected disposable or approved database. It was not run as part of this restructure.

## Architecture and data

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) describes the implemented modules.
- [DATABASE_OVERVIEW.md](./DATABASE_OVERVIEW.md) documents current models and relationships.
- [client/README.md](./client/README.md) contains calculator-specific behavior and deployment notes.

No WhatsApp rate-import integration, OCR, Gemini, authentication system, or admin UI is implemented.
