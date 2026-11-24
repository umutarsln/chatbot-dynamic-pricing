import { afterEach, expect, it, vi } from "vitest";
import { fetchHotelRates, findHotel } from "./makcorps-client";

afterEach(() => vi.unstubAllGlobals());
const stay = { checkin: "2026-12-01", checkout: "2026-12-02", adults: 2, rooms: 1, currency: "TRY" as const };
it("sends the documented parameters with no cache or redirects", async () => {
  const fetcher = vi.fn().mockResolvedValue(Response.json({ comparison: [] })); vi.stubGlobal("fetch", fetcher);
  await fetchHotelRates("123", stay, "test-secret");
  const [url, options] = fetcher.mock.calls[0];
  expect(url.origin).toBe("https://api.makcorps.com");
  expect(url.searchParams.get("cur")).toBe("TRY");
  expect(url.searchParams.get("hotelid")).toBe("123");
  expect(url.searchParams.get("adults")).toBe("2");
  expect(url.searchParams.get("api_key")).toBe("test-secret");
  expect(options).toMatchObject({ cache: "no-store", redirect: "error" });
});
it("does not retry paid requests and never forwards credential-bearing errors", async () => {
  const fetcher = vi.fn().mockRejectedValue(new Error("https://api.makcorps.com/?api_key=test-secret")); vi.stubGlobal("fetch", fetcher);
  await expect(findHotel("Test", "test-secret")).rejects.toThrow("Makcorps yanıtı alınamadı");
  expect(fetcher).toHaveBeenCalledTimes(1);
});
it("maps provider limits to 429", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("secret provider response", { status: 429 })));
  await expect(findHotel("Test", "test-secret")).rejects.toMatchObject({ status: 429 });
});
it("rejects provider errors with HTTP 200", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "Invalid key" })));
  await expect(findHotel("Test", "test-secret")).rejects.toMatchObject({ status: 502 });
});
it("exposes only the HTTP status for upstream errors, never the raw body", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("credential=test-secret", { status: 400 })));
  await expect(findHotel("Test", "test-secret")).rejects.toThrow("Makcorps isteği tamamlanamadı (HTTP 400). Hesap erişimini ve kredileri kontrol edin.");
});
