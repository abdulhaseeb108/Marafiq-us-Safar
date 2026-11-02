# Database overview

MongoDB is accessed through Mongoose. This restructure does not rename collections, fields, or relationships and does not run database writes or migrations.

| Model | Purpose and relationships |
|---|---|
| `Hotel` | Hotel catalog keyed by city/name, with seasonal rate subdocuments, availability, pricing style, location metadata, and active flag. The calculator looks up active hotels and evaluates rate seasons in application code. |
| `Snapshot` | Stores estimate `inputs`, calculation `result`, `createdAt`, and `expiresAt`. `Lead.snapshotId` references a snapshot. The schema does not declare a TTL index, so `expiresAt` alone does not delete expired records. |
| `Lead` | Stores a priced Umrah request and reference number. `snapshotId` references one Snapshot and is declared unique; `referenceNo` is also declared unique. |
| `Enquiry` | Stores custom/quote-only requests and their itinerary details. It is not linked to a Snapshot. |
| `Counter` | Uses a string `_id` per monthly sequence and an incrementing `seq` for request references. |

Mongoose's standard `_id` index applies. The schemas declare unique indexes for lead/enquiry reference numbers and lead snapshot IDs; no explicit compound indexes were found for hotel city/active lookups or the recent enquiry phone/destination/time query. Confirm production query patterns before adding indexes, and use a non-destructive migration if needed.

## Seeding and data safety

The bundled WMT seasonal catalog is in `server/src/data/hotels.js`. The `npm run seed` command runs `server/src/scripts/seedHotels.js`, which calls `Hotel.deleteMany({})` before inserting the bundled catalog. This replaces all documents in the Hotel collection and must not be run against production or any database whose existing hotel records must be retained.

No database connection was used for this refactor. The offline catalog supports hotel listing and preview estimates only in non-production; leads, enquiries, and persisted snapshots require MongoDB.
