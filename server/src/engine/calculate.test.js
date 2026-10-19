import { test } from "node:test";
import assert from "node:assert";
import { calculate } from "./calculate.js";
import { allocateRooms } from "./rooms.js";

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