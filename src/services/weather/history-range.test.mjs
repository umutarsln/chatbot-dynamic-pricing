import assert from "node:assert/strict";
import { test } from "node:test";
import { getHistoryBounds, validateHistoryRange, listHistoryDates } from "./history-range.ts";

const now = new Date("2026-11-23T21:30:00Z");
test("uses Istanbul calendar date and a seven-day archive lag", () => {
  assert.deepEqual(getHistoryBounds(now), { earliestDate: "1940-01-01", latestDate: "2026-11-17", startDate: "2026-10-19", endDate: "2026-11-17" });
});
test("includes leap days and both range endpoints", () => {
  const range = validateHistoryRange("2024-02-28", "2024-03-01", now);
  assert.deepEqual(listHistoryDates(range), ["2024-02-28", "2024-02-29", "2024-03-01"]);
  assert.equal(listHistoryDates(validateHistoryRange("2024-01-01", "2024-12-31", now)).length, 366);
});
for (const [start, end] of [
  ["2026-02-30", "2026-03-01"], ["2026-11-18", "2026-11-19"], ["1939-12-31", "1940-01-02"],
  ["2025-01-01", "2026-01-02"], ["2026-01-02", "2026-01-01"], [null, "2026-01-01"],
]) {
  test(`rejects invalid or unavailable range ${start} / ${end}`, () => assert.throws(() => validateHistoryRange(start, end, now)));
}
