# Project structure

The client and server remain separate npm applications. No root workspace, alternate framework, empty automation placeholders, or new state-management layer was introduced.

```text
umrah-calculator/
├── .gitignore
├── README.md
├── API_DOCUMENTATION.md
├── DATABASE_OVERVIEW.md
├── ENVIRONMENT_VARIABLES.md
├── PROJECT_STRUCTURE.md
├── client/
│   ├── .gitignore
│   ├── .oxlintrc.json
│   ├── README.md
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── public/
│   │   └── favicon.svg
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       │   ├── common/
│       │   │   ├── BrandArt.jsx
│       │   │   └── ui/
│       │   │       ├── ComingSoonLoader.jsx
│       │   │       └── Counter.jsx
│       │   ├── forms/
│       │   │   └── LeadForm.jsx
│       │   └── layout/
│       │       └── SiteHeader.jsx
│       ├── data/
│       │   └── calculator.jsx
│       ├── features/
│       │   ├── calculator/
│       │   │   ├── components/
│       │   │   │   ├── ArrivalDatePicker.jsx
│       │   │   │   ├── HotelStep.jsx
│       │   │   │   └── UmrahWizard.jsx
│       │   │   ├── services/
│       │   │   │   └── calculatorApi.js
│       │   │   └── utils/
│       │   │       └── travel.js
│       │   └── enquiries/
│       │       └── components/
│       │           ├── CheckGroup.jsx
│       │           └── OtherTripPage.jsx
│       ├── pages/
│       │   ├── ComingSoonPage.jsx
│       │   ├── HomePage.jsx
│       │   └── NotFoundPage.jsx
│       ├── routes/
│       │   └── paths.js
│       ├── services/
│       │   └── api.js
│       └── styles/
│           └── global.css
└── server/
    ├── package.json
    ├── package-lock.json
    └── src/
        ├── app.js
        ├── server.js
        ├── index.js                 # compatibility entry point
        ├── config/
        │   └── database.js
        ├── controllers/
        │   ├── enquiryController.js
        │   ├── estimateController.js
        │   ├── hotelController.js
        │   ├── leadController.js
        │   └── systemController.js
        ├── data/
        │   └── hotels.js            # bundled development catalog
        ├── engine/
        │   ├── calculate.js
        │   ├── calculate.test.js
        │   ├── rooms.js
        │   ├── routes.js
        │   ├── rules.js
        │   ├── seasons.js
        │   ├── validation.js
        │   └── validation.test.js
        ├── middleware/
        │   └── rateLimiter.js
        ├── models/
        │   ├── Counter.js
        │   ├── Enquiry.js
        │   ├── Hotel.js
        │   ├── Lead.js
        │   └── Snapshot.js
        ├── routes/
        │   ├── api.test.js
        │   ├── enquiryRoutes.js
        │   ├── estimateRoutes.js
        │   ├── hotelRoutes.js
        │   ├── index.js
        │   ├── leadRoutes.js
        │   └── systemRoutes.js
        ├── scripts/
        │   └── seedHotels.js
        ├── services/
        │   ├── databaseMode.js
        │   ├── estimateService.js
        │   ├── hotelService.js
        │   └── referenceService.js
        └── validators/
            └── contact.js
```

## Boundaries

- `client/src/pages` composes page-level screens. `components` contains shared presentation pieces. Calculator-specific components and travel helpers live in `features/calculator`; the existing unmounted custom enquiry screen is retained under `features/enquiries`.
- `client/src/services/api.js` owns the configurable API origin and JSON headers. The public route paths remain defined in `routes/paths.js`.
- `server/src/app.js` configures Express middleware and mounts API routers. `server.js` owns startup and database connection; `index.js` remains as a compatibility entry point for deployments that still invoke the old path.
- `controllers` translate HTTP requests and responses. `services` coordinate hotel access, estimates, database mode, and reference numbers. `engine` retains the calculation and validation behavior. `models` and their collection/field contracts remain unchanged.
- `data/hotels.js` is the pure bundled rate catalog. `scripts/seedHotels.js` is the explicit database seeder; it is destructive to existing Hotel documents.
- WhatsApp/OCR/Gemini integrations and automation jobs are intentionally absent until that feature is implemented.
