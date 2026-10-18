import { test } from "node:test";
import assert from "node:assert";
import { calculate } from "./calculate.js";

test("4 adults, 7 nights Makkah, 5 nights Madinah", () => {
  const result = calculate({
    adults: 4,
    makkahNights: 7,
    madinahNights: 5,
    makkahRatePp: 40,
    madinahRatePp: 44,
  });

  assert.strictEqual(result.totalSar, 4500);
  assert.strictEqual(result.perPersonSar, 1125);
});