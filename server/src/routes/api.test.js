import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";

process.env.NODE_ENV = "test";
const { default: app } = await import("../app.js");

test("API health, hotel listing, estimate preview, and PDF remain available", async (t) => {
  const server = app.listen(0);
  await once(server, "listening");
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  const origin = `http://127.0.0.1:${server.address().port}`;

  const healthResponse = await fetch(`${origin}/api/health`);
  assert.equal(healthResponse.status, 200);
  assert.deepEqual(await healthResponse.json(), { status: "ok" });

  const makkahResponse = await fetch(`${origin}/api/hotels?city=makkah&date=2026-10-06`);
  const madinahResponse = await fetch(`${origin}/api/hotels?city=madinah&date=2026-10-07`);
  assert.equal(makkahResponse.status, 200);
  assert.equal(madinahResponse.status, 200);
  const makkahHotels = await makkahResponse.json();
  const madinahHotels = await madinahResponse.json();
  const makkahHotel = makkahHotels.find((hotel) => hotel.rates?.share != null);
  const madinahHotel = madinahHotels.find((hotel) => hotel.rates?.share != null);
  assert.ok(makkahHotel);
  assert.ok(madinahHotel);

  const payload = {
    adults: 2,
    children: 0,
    infants: 0,
    roomType: "sharing",
    startDate: "2026-10-06",
    route: "route1",
    makkahNights: 1,
    madinahNights: 1,
    makkahHotelId: makkahHotel._id,
    madinahHotelId: madinahHotel._id,
    preview: true,
  };
  const estimateResponse = await fetch(`${origin}/api/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  assert.equal(estimateResponse.status, 200);
  const estimate = await estimateResponse.json();
  assert.equal(estimate.stays.length, 2);
  assert.ok(estimate.totalPkr > 0);
  assert.ok(estimate.highPkr >= estimate.totalPkr);

  const pdfResponse = await fetch(`${origin}/api/estimate-pdf`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...payload, preview: undefined }),
  });
  assert.equal(pdfResponse.status, 200);
  assert.match(pdfResponse.headers.get("content-type"), /application\/pdf/);
  const pdf = new Uint8Array(await pdfResponse.arrayBuffer());
  assert.equal(new TextDecoder().decode(pdf.slice(0, 4)), "%PDF");
});
