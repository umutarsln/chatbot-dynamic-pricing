// @vitest-environment jsdom
import { StrictMode } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import CompetitorPrices from "./competitor-prices";
import { pilotHotels } from "@/data/pilot-hotels";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const stay = { checkin: "2026-12-01", checkout: "2026-12-02", adults: 2, rooms: 1, currency: "TRY" };
const result = { hotelId: "123", stay, fetchedAt: "2026-11-24T12:00:00Z", quotes: [{ vendor: "Booking.com", price: "TRY 1.200", tax: null, total: null }, { vendor: "Test OTA", price: "TRY 1.100", tax: "TRY 100", total: null }] };
const report = { stay, fetchedAt: result.fetchedAt, hotels: pilotHotels.map((hotel, index) => ({ hotel: hotel.id, status: index === 0 ? "ready" : "error", ...(index === 0 ? { result } : { message: "Provider error" }) })) };
it("fetches all hotels exactly once on landing, including Strict Mode effect replay", async () => {
  const fetcher = vi.fn().mockImplementation(() => Promise.resolve(Response.json(report))); vi.stubGlobal("fetch", fetcher);
  render(<StrictMode><CompetitorPrices /></StrictMode>);
  expect(await screen.findByText("TRY 1.200")).toBeDefined();
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toMatchObject({ action: "prices", hotels: pilotHotels.map((hotel) => hotel.id) });
});
it("filters multiple hotels and handles no selection without making paid requests", async () => {
  const fetcher = vi.fn().mockImplementation(() => Promise.resolve(Response.json(report))); vi.stubGlobal("fetch", fetcher);
  render(<CompetitorPrices />);
  await screen.findByText("TRY 1.200");
  fireEvent.click(screen.getByRole("checkbox", { name: "Akra Antalya" }));
  expect(screen.queryByText("TRY 1.200")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Tümünü seç" }));
  expect(screen.getByText("TRY 1.200")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Seçimi temizle" }));
  expect(screen.getByText(/Gösterilecek otel seçilmedi/)).toBeDefined();
  expect(fetcher).toHaveBeenCalledTimes(1);
});
it("opens all channel prices with tax details and performs only explicit refresh", async () => {
  const fetcher = vi.fn().mockImplementation(() => Promise.resolve(Response.json(report))); vi.stubGlobal("fetch", fetcher);
  render(<CompetitorPrices />);
  await screen.findByText("TRY 1.200");
  fireEvent.click(screen.getByRole("button", { name: "2 kanal · Ayrıntılar →" }));
  const details = screen.getByRole("region", { name: "Akra Antalya kanal ayrıntıları" });
  expect(within(details).getByText("TRY 100")).toBeDefined();
  fireEvent.change(screen.getByLabelText("Giriş", { exact: true }), { target: { value: "2026-12-03" } });
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(screen.getByText(/2026-12-01 → 2026-12-02 · 2 yetişkin · TRY istendi/)).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Tüm fiyatları yenile" }));
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  expect(JSON.parse(fetcher.mock.calls[1][1].body).checkin).toBe("2026-12-03");
});
it("shows configuration/network failure and offers an explicit retry without fake prices", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "Anahtar gerekli" }, { status: 503 })));
  render(<CompetitorPrices />);
  expect((await screen.findByRole("alert")).textContent).toContain("Anahtar gerekli");
  expect(screen.getByRole("button", { name: "Tüm fiyatları yenile" })).toBeDefined();
  expect(screen.queryByText("TRY 1.200")).toBeNull();
});
