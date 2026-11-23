import assert from "node:assert/strict";
import { test } from "node:test";
import { parseHistoricalWeather, fetchHistoricalWeather } from "./open-meteo-client.ts";
import { weatherRegions } from "../../data/weather-regions.ts";
const range = { startDate: "2026-01-01", endDate: "2026-01-02" };
function fixture() {
  return { timezone: "Europe/Istanbul", utc_offset_seconds: 10800, daily: {
    time: ["2026-01-01", "2026-01-02"], weather_code: [0, 61],
    temperature_2m_min: [10, 8], temperature_2m_max: [20, 18], temperature_2m_mean: [15, 13],
    precipitation_sum: [0, 6.2], wind_speed_10m_max: [10, null],
  } };
}
test("normalizes the complete historical period without inventing rain probabilities", () => {
  const days = parseHistoricalWeather(fixture(), range);
  assert.deepEqual(days[0], { date: "2026-01-01", code: 0, min: 10, max: 20, mean: 15, rainAmount: 0, windSpeed: 10 });
  assert.equal(days[1].windSpeed, null);
  assert.equal("rainProbability" in days[0], false);
});
for (const [name, change] of [
  ["missing dates", (data) => { data.daily.time.pop(); }],
  ["incorrect date order", (data) => { data.daily.time.reverse(); }],
  ["not-yet-published temperatures", (data) => { data.daily.temperature_2m_mean[1] = null; }],
  ["out-of-range average", (data) => { data.daily.temperature_2m_mean[1] = 30; }],
  ["negative rain", (data) => { data.daily.precipitation_sum[1] = -2; }],
  ["fractional weather code", (data) => { data.daily.weather_code[1] = 1.5; }],
  ["wrong timezone", (data) => { data.timezone = "UTC"; }],
]) test(`rejects ${name} before persistence`, () => { const data = fixture(); change(data); assert.throws(() => parseHistoricalWeather(data, range)); });

test("requests ERA5 with explicit dates and units on the archive endpoint", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url.hostname, "archive-api.open-meteo.com");
    assert.equal(url.pathname, "/v1/archive");
    for (const [key, value] of Object.entries({ models: "era5", start_date: range.startDate, end_date: range.endDate, timezone: "Europe/Istanbul", temperature_unit: "celsius", precipitation_unit: "mm", wind_speed_unit: "kmh" })) assert.equal(url.searchParams.get(key), value);
    assert.equal(options.redirect, "error");
    assert.equal(options.cache, "no-store");
    return Response.json(fixture());
  });
  assert.equal((await fetchHistoricalWeather(weatherRegions[0], range)).length, 2);
});
test("uses a commercial archive host and never returns the key", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(url.hostname, "customer-archive-api.open-meteo.com");
    assert.equal(url.searchParams.get("apikey"), "test-key");
    return Response.json(fixture());
  });
  assert.equal(JSON.stringify(await fetchHistoricalWeather(weatherRegions[0], range, "test-key")).includes("test-key"), false);
});
test("rejects archive quota failures", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("quota", { status: 429 }));
  await assert.rejects(fetchHistoricalWeather(weatherRegions[0], range), { message: "Weather archive unavailable" });
});
