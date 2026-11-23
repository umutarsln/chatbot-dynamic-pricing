import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { weatherRegions } from "../../data/weather-regions.ts";
import { readStoredHistory, saveHistoricalDays } from "./history-store.ts";

const region = weatherRegions[0];
const range = { startDate: "2026-01-01", endDate: "2026-01-03" };
const day = (date, mean = 15) => ({ date, code: 0, min: 10, max: 20, mean, rainAmount: 0, windSpeed: null });
function database(t) {
  const directory = mkdtempSync(join(tmpdir(), "otai-weather-test-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return join(directory, "archive.sqlite");
}

test("persists records after connections are closed and reopened", (t) => {
  const path = database(t);
  assert.equal(saveHistoricalDays(path, region, [day("2026-01-02"), day("2026-01-01")]), 2);
  const stored = readStoredHistory(path, region, range);
  assert.equal(stored.totalStored, 2);
  assert.deepEqual(stored.days.map((entry) => entry.date), ["2026-01-01", "2026-01-02"]);
  assert.equal(stored.days[0].rainAmount, 0);
  assert.equal(stored.days[0].windSpeed, null);
  assert.ok(Number.isFinite(Date.parse(stored.days[0].fetchedAt)));
  assert.equal(stored.firstStoredDate, "2026-01-01");
  assert.equal(stored.lastStoredDate, "2026-01-02");
});

test("retries and overlapping imports neither duplicate nor overwrite existing snapshots", (t) => {
  const path = database(t);
  saveHistoricalDays(path, region, [day("2026-01-01")]);
  const initial = readStoredHistory(path, region, range).days[0];
  assert.equal(saveHistoricalDays(path, region, [day("2026-01-01", 18), day("2026-01-02")]), 1);
  assert.equal(saveHistoricalDays(path, region, [day("2026-01-02")]), 0);
  const stored = readStoredHistory(path, region, range);
  assert.equal(stored.totalStored, 2);
  assert.deepEqual(stored.days[0], initial);
});

test("isolates regions, coordinate revisions and selected date ranges", (t) => {
  const path = database(t);
  saveHistoricalDays(path, region, [day("2026-01-01"), day("2026-01-02")]);
  assert.equal(readStoredHistory(path, weatherRegions[1], range).days.length, 0);
  assert.equal(readStoredHistory(path, { ...region, latitude: region.latitude + .001 }, range).days.length, 0);
  const stored = readStoredHistory(path, region, { startDate: "2026-01-02", endDate: "2026-01-02" });
  assert.equal(stored.days.length, 1);
  assert.equal(stored.totalStored, 2);
});

test("rolls back the entire batch when a write fails", (t) => {
  const path = database(t);
  saveHistoricalDays(path, region, [day("2026-01-01")]);
  assert.throws(() => saveHistoricalDays(path, region, [day("2026-01-02"), { ...day("2026-01-03"), code: 1.5 }]));
  const stored = readStoredHistory(path, region, range);
  assert.equal(stored.totalStored, 1);
  assert.equal(stored.days[0].date, "2026-01-01");
});
