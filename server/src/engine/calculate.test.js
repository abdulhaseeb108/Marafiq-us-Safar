import { test } from "node:test";
import assert from "node:assert";
import { calculate } from "./calculate.js";
import { allocateRooms, validRoomAllocation } from "./rooms.js";

const A = { share: 32, quad: 40, triple: 54, double: 80, room: 160 };
const B = { share: 44, quad: 55, triple: 74, double: 110, room: 220 };

// Simple rules so the expected numbers are easy to check by hand
const ZERO = {
  version: "test", fxSarToPkr: 100, fxBufferPct: 0,
  serviceChargePct: 0, paymentCostPct: 0, rangeBufferPct: 0,
  infantPackageSar: 460,
};

test("4 adults quad, 7 + 5 nights, no fees = 4500", () => {
  const r = calculate({
    adults: 4, roomType: 4,
    makkahSeasons: Array(7).fill(A),
    madinahSeasons: Array(5).fill({ ...A, quad: 44 }),
  }, ZERO);
  assert.strictEqual(r.supplierSar, 4500);
  assert.strictEqual(r.totalSar, 4500);
});

test("service fee 10%, range 10%, PKR at 100", () => {
  const rules = { ...ZERO, serviceChargePct: 10, rangeBufferPct: 10 };
  const r = calculate({
    adults: 4, roomType: 4,
    makkahSeasons: Array(7).fill(A),
    madinahSeasons: Array(5).fill({ ...A, quad: 44 }),
  }, rules);
  assert.strictEqual(r.totalSar, 4950);
  assert.strictEqual(r.highSar, 5445);
  assert.strictEqual(r.totalPkr, 495000);
  assert.strictEqual(r.fxSarToPkr, 100);
});

test("stay crossing the season change", () => {
  const r = calculate({
    adults: 4, roomType: 4,
    makkahSeasons: [A, A, B, B], madinahSeasons: [],
  }, ZERO);
  assert.strictEqual(r.totalSar, 3260);
});

test("2 adults + 1 infant, no hotel nights", () => {
  const r = calculate({
    adults: 2, infants: 1, roomType: 2,
    makkahSeasons: [], madinahSeasons: [],
  }, ZERO);
  assert.strictEqual(r.totalSar, 1810); // 675 x 2 + 460
});

test("room allocation", () => {
  assert.deepStrictEqual(allocateRooms(5, 4), [4, 1]);
  assert.deepStrictEqual(allocateRooms(6, 3), [3, 3]);
  assert.deepStrictEqual(allocateRooms(3, 2), [2, 1]);
});
test("custom room allocation is validated and uses existing room rates", () => {
  assert.strictEqual(validRoomAllocation([4, 2], 6), true);
  assert.strictEqual(validRoomAllocation([4, 2], 5), false);
  assert.strictEqual(validRoomAllocation([5, 1], 6), false);

  const r = calculate({
    adults: 6, roomType: 4, roomAllocations: [3, 3],
    makkahSeasons: [A], madinahSeasons: [],
  }, ZERO);
  assert.deepStrictEqual(r.rooms, [3, 3]);
  assert.strictEqual(r.lineItems[1].sar, 324);
});
test("all children count toward hotel room allocations", () => {
  const r = calculate({
    adults: 2, children: 2,
    roomType: 2, roomAllocations: [2, 2],
    makkahSeasons: [A], madinahSeasons: [],
  }, ZERO);
  assert.strictEqual(r.lineItems[1].sar, 320);
  assert.ok(r.assumptions.includes("Rooms: 2 + 2 guests per room. A guest alone in a room pays the full room rate."));
});
test("flat room-basis hotel charges the room price, not per person", () => {
  const r = calculate({
    adults: 4, roomType: 4,
    makkahSeasons: [{ room: 110, style: "room_only" }], madinahSeasons: [],
  }, ZERO);
  assert.strictEqual(r.totalSar, 2610); // 2500 package + 110 room
});
test("sharing uses the share rate per person", () => {
  const r = calculate({
    adults: 2, roomType: "sharing",
    makkahSeasons: Array(3).fill({ ...A, style: "per_person" }), madinahSeasons: [],
  }, ZERO);
  assert.strictEqual(r.totalSar, 1542); // 675 x 2 + 32 x 2 x 3
});

test("any room type is priced as quad", () => {
  const r = calculate({
    adults: 4, roomType: "any",
    makkahSeasons: [{ ...A, style: "per_person" }], madinahSeasons: [],
  }, ZERO);
  assert.strictEqual(r.totalSar, 2660); // 2500 + 40 x 4
});

test("infants at 0 are not charged", () => {
  const r = calculate({
    adults: 2, infants: 1, roomType: 2,
    makkahSeasons: [], madinahSeasons: [],
  }, { ...ZERO, infantPackageSar: 0 });
  assert.strictEqual(r.totalSar, 1350);
});