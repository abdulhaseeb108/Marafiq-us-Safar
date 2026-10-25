import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isCalendarDate, isKnownRoute, isSupportedEstimateRoute, validStayNights, validTravelerCounts,
} from "./validation.js";
import { ROUTE_SEGMENTS } from "./routes.js";

test("calendar dates reject impossible days and malformed values", () => {
  assert.strictEqual(isCalendarDate("2026-11-30"), true);
  assert.strictEqual(isCalendarDate("2026-11-31"), false);
  assert.strictEqual(isCalendarDate("2026-2-03"), false);
  assert.strictEqual(isCalendarDate(""), false);
});

test("traveler counts stay within the calculator limits", () => {
  assert.strictEqual(validTravelerCounts({ adults: 30, children: 30, infants: 30 }), true);
  assert.strictEqual(validTravelerCounts({ adults: 31, children: 0, infants: 0 }), false);
  assert.strictEqual(validTravelerCounts({ adults: 1, children: 31, infants: 0 }), false);
  assert.strictEqual(validTravelerCounts({ adults: 1, children: 0, infants: 2 }), false);
  assert.strictEqual(validTravelerCounts({ adults: 0, children: 0, infants: 0 }), false);
});

test("stay lengths match the calculator's one-to-sixty-night controls", () => {
  assert.strictEqual(validStayNights({ makkahNights: 1, madinahNights: 60 }), true);
  assert.strictEqual(validStayNights({ makkahNights: 0, madinahNights: 3 }), false);
  assert.strictEqual(validStayNights({ makkahNights: 61, madinahNights: 3 }), false);
});

test("only supplier-supported routes may receive an online estimate", () => {
  assert.strictEqual(isSupportedEstimateRoute("route1"), true);
  assert.strictEqual(isSupportedEstimateRoute("route2"), true);
  assert.strictEqual(isSupportedEstimateRoute("route3"), false);
  assert.strictEqual(isSupportedEstimateRoute("route4"), false);
  assert.strictEqual(isSupportedEstimateRoute("custom"), false);
  assert.strictEqual(isKnownRoute("route4"), true);
  assert.strictEqual(isKnownRoute("unknown"), false);
  assert.deepStrictEqual(ROUTE_SEGMENTS.route3, ["makkah", "madinah", "makkah"]);
  assert.deepStrictEqual(ROUTE_SEGMENTS.route4, ["makkah", "madinah", "makkah"]);
  assert.deepStrictEqual(ROUTE_SEGMENTS.custom, []);
});
