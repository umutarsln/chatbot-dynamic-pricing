import assert from "node:assert/strict";
import { test } from "node:test";
import { fetchWeather, parseWeather } from "./open-meteo-client.ts";
import { weatherRegions } from "../../data/weather-regions.ts";

const region = weatherRegions[0];
function fixture() {
  return {
    timezone: "Europe/Istanbul", utc_offset_seconds: 10800,
    current: { time: "2026-11-24T14:15", temperature_2m: 21.5, apparent_temperature: 22, relative_humidity_2m: 60, wind_speed_10m: 12, weather_code: 2 },
    daily: { time: ["2026-11-24", "2026-11-25"], weather_code: [2, 61], temperature_2m_min: [14, 13], temperature_2m_max: [22, 20], precipitation_probability_max: [0, 80], precipitation_sum: [0, 6.2] },
  };
}

test("normalizes current and daily conditions with an explicit Istanbul offset", () => {
  const report = parseWeather(fixture(), region);
  assert.equal(report.region.id, "antalya");
  assert.equal(report.current.time, "2026-11-24T14:15+03:00");
  assert.equal(report.current.temperature, 21.5);
  assert.deepEqual(report.days[1], { date: "2026-11-25", code: 61, min: 13, max: 20, rainProbability: 80, rainAmount: 6.2 });
  assert.ok(Number.isFinite(Date.parse(report.fetchedAt)));
});

test("preserves zero rain and missing measurements", () => {
  const data = fixture();
  data.current.temperature_2m = null;
  data.daily.temperature_2m_min[0] = null;
  data.daily.precipitation_probability_max[1] = null;
  const report = parseWeather(data, region);
  assert.equal(report.current.temperature, null);
  assert.equal(report.days[0].rainProbability, 0);
  assert.equal(report.days[1].rainProbability, null);
  assert.equal(report.days[0].min, null);
});

for (const [name, change] of [
  ["empty forecasts", (data) => { data.daily.time = []; }],
  ["mismatched forecast arrays", (data) => { data.daily.precipitation_sum = []; }],
  ["missing current fields", (data) => { delete data.current.wind_speed_10m; }],
  ["non-numeric values", (data) => { data.current.temperature_2m = "21"; }],
  ["invalid percentages", (data) => { data.daily.precipitation_probability_max[0] = 101; }],
  ["non-finite readings", (data) => { data.current.temperature_2m = NaN; }],
  ["wrong timezone", (data) => { data.timezone = "UTC"; }],
  ["wrong UTC offset", (data) => { data.utc_offset_seconds = 0; }],
  ["invalid timestamp", (data) => { data.current.time = "not-a-date"; }],
  ["invalid calendar date", (data) => { data.daily.time[0] = "2026-02-30"; }],
  ["duplicate dates", (data) => { data.daily.time[1] = data.daily.time[0]; }],
  ["reversed temperatures", (data) => { data.daily.temperature_2m_min[0] = 30; }],
]) {
  test(`rejects ${name}`, () => {
    const data = fixture();
    change(data);
    assert.throws(() => parseWeather(data, region));
  });
}

test("rejects non-object provider responses", () => {
  for (const value of [null, [], "invalid"]) assert.throws(() => parseWeather(value, region));
});

test("requests the selected region, seven days and explicit units exactly once", async (t) => {
  let requestUrl;
  const mock = t.mock.method(globalThis, "fetch", async (url, options) => {
    requestUrl = new URL(url);
    assert.equal(options.cache, "no-store");
    assert.equal(options.redirect, "error");
    assert.ok(options.signal instanceof AbortSignal);
    return Response.json(fixture());
  });
  const belek = weatherRegions.find((item) => item.id === "belek");
  const report = await fetchWeather(belek);
  assert.equal(mock.mock.callCount(), 1);
  assert.equal(requestUrl.hostname, "api.open-meteo.com");
  for (const [key, value] of Object.entries({ latitude: String(belek.latitude), longitude: String(belek.longitude), timezone: "Europe/Istanbul", forecast_days: "7", wind_speed_unit: "kmh", temperature_unit: "celsius", precipitation_unit: "mm" })) {
    assert.equal(requestUrl.searchParams.get(key), value);
  }
  assert.equal(requestUrl.searchParams.has("apikey"), false);
  assert.equal(report.region.id, "belek");
});

test("selects the commercial host without including the secret in the report", async (t) => {
  t.mock.method(globalThis, "fetch", async (url) => {
    assert.equal(url.hostname, "customer-api.open-meteo.com");
    assert.equal(url.searchParams.get("apikey"), "test-key");
    return Response.json(fixture());
  });
  assert.equal(JSON.stringify(await fetchWeather(region, "test-key")).includes("test-key"), false);
});

test("does not expose rate-limit response details", async (t) => {
  t.mock.method(globalThis, "fetch", async () => Response.json({ error: true, reason: "private-provider-message" }, { status: 429 }));
  await assert.rejects(fetchWeather(region), { message: "Weather provider unavailable" });
});

test("propagates timeouts for safe route error mapping", async (t) => {
  t.mock.method(globalThis, "fetch", async () => { throw new DOMException("Timed out", "TimeoutError"); });
  await assert.rejects(fetchWeather(region), { name: "TimeoutError" });
});

test("rejects malformed provider JSON", async (t) => {
  t.mock.method(globalThis, "fetch", async () => new Response("not-json"));
  await assert.rejects(fetchWeather(region), SyntaxError);
});
