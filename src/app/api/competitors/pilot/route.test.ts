import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { GET, POST } from "./route";

const state = globalThis as typeof globalThis & { makcorpsPilot?: unknown };
beforeEach(() => { delete state.makcorpsPilot; vi.stubEnv("NODE_ENV", "development"); vi.stubEnv("MAKCORPS_API_KEY", "test-secret"); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });
function request(body: unknown, origin = "http://localhost:3005") {
  return new Request("http://localhost:3005/api/competitors/pilot", { method: "POST", headers: { host: "localhost:3005", origin, "Content-Type": "application/json" }, body: JSON.stringify(body) });
}
it("reports configuration without secrets", async () => {
  const response = await GET(new Request("http://localhost:3005/api/competitors/pilot"));
  expect(await response.json()).toEqual({ configured: true, local: true });
  expect(response.headers.get("cache-control")).toBe("no-store");
});
it("returns 503 without credentials and makes no network request", async () => {
  vi.stubEnv("MAKCORPS_API_KEY", ""); const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  expect((await POST(request({ action: "mapping", hotel: "akra" }))).status).toBe(503);
  expect(fetcher).not.toHaveBeenCalled();
});
it("returns 403 before calling a provider for cross-origin and production requests", async () => {
  const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  expect((await POST(request({}, "http://attacker.test"))).status).toBe(403);
  vi.stubEnv("NODE_ENV", "production");
  expect((await POST(request({}))).status).toBe(403);
  expect(fetcher).not.toHaveBeenCalled();
});
it("rejects unknown hotel IDs and rates without a verified candidate", async () => {
  const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
  expect((await POST(request({ action: "mapping", hotel: "unknown" }))).status).toBe(400);
  expect((await POST(request({ action: "rates", hotel: "akra", hotelId: "999", addressConfirmed: true, checkin: "2099-01-01", checkout: "2099-01-02", adults: 2, rooms: 1, currency: "TRY" }))).status).toBe(400);
  expect(fetcher).not.toHaveBeenCalled();
});
it("requires a previously returned mapping ID, address confirmation and identical stay parameters", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json([{ type: "HOTEL", document_id: "123", name: "Test", details: { address: "Test Street" } }])).mockResolvedValueOnce(Response.json({ comparison: [[{ vendor1: "Test OTA", price1: "TRY 120" }]] }));
  vi.stubGlobal("fetch", fetcher);
  expect((await POST(request({ action: "mapping", hotel: "akra" }))).status).toBe(200);
  const start = new Date(); start.setUTCDate(start.getUTCDate() + 7);
  const end = new Date(start); end.setUTCDate(end.getUTCDate() + 1);
  const body = { action: "rates", hotel: "akra", hotelId: "123", addressConfirmed: true, checkin: start.toISOString().slice(0, 10), checkout: end.toISOString().slice(0, 10), adults: 2, rooms: 1, currency: "TRY" };
  expect((await POST(request({ ...body, hotelId: "999" }))).status).toBe(400);
  expect((await POST(request({ ...body, addressConfirmed: false }))).status).toBe(400);
  const response = await POST(request(body));
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ hotelId: "123", stay: { checkin: body.checkin, checkout: body.checkout }, quotes: [{ vendor: "Test OTA", price: "TRY 120" }] });
  expect(fetcher).toHaveBeenCalledTimes(2);
});
it("caps paid requests at 20 per hour and returns 429", async () => {
  const fetcher = vi.fn().mockImplementation(() => Promise.resolve(Response.json([]))); vi.stubGlobal("fetch", fetcher);
  for (let i = 0; i < 20; i++) expect((await POST(request({ action: "mapping", hotel: "akra" }))).status).toBe(200);
  const response = await POST(request({ action: "mapping", hotel: "akra" }));
  expect(response.status).toBe(429); expect(fetcher).toHaveBeenCalledTimes(20);
});
it("rejects oversized and malformed request bodies", async () => {
  expect((await POST(request({ text: "a".repeat(2049) }))).status).toBe(413);
  expect((await POST(request([]))).status).toBe(400);
  const invalid = request({});
  expect((await POST(new Request(invalid.url, { method: "POST", headers: invalid.headers, body: "{" }))).status).toBe(400);
});
