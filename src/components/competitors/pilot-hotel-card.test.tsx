// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { pilotHotels } from "@/data/pilot-hotels";
import { PilotHotelCard } from "./pilot-hotel-card";

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const stay = { checkin: "2026-12-01", checkout: "2026-12-02", adults: 2, rooms: 1, currency: "TRY" as const };
function Harness({ enabled = true }: { enabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  return <PilotHotelCard hotel={pilotHotels[0]} index={1} stay={stay} enabled={enabled} busy={busy} onBusy={setBusy} onCoverage={() => {}} />;
}
it("never searches automatically or selects a candidate without address confirmation", async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(Response.json({ candidates: [{ id: "123", name: "Test Hotel", address: "Test Street", location: "Antalya" }] })).mockResolvedValueOnce(Response.json({ hotelId: "123", stay, fetchedAt: "2026-11-24T10:00:00Z", quotes: [{ vendor: "Test OTA", price: "TRY 120", tax: null, total: null }] }));
  vi.stubGlobal("fetch", fetcher);
  render(<Harness />);
  expect(fetcher).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "1. Oteli Makcorps’ta ara" }));
  const candidate = await screen.findByRole("radio");
  expect((candidate as HTMLInputElement).checked).toBe(false);
  fireEvent.click(candidate);
  expect((screen.getByRole("button", { name: "2. Fiyatları getir" }) as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "2. Fiyatları getir" }));
  expect(await screen.findByText("TRY 120")).toBeDefined();
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(JSON.parse(fetcher.mock.calls[1][1].body)).toMatchObject({ action: "rates", hotelId: "123", addressConfirmed: true, ...stay });
  fireEvent.click(screen.getAllByRole("checkbox")[0]);
  await waitFor(() => expect(screen.queryByText("TRY 120")).toBeNull());
});
it("shows provider failures without inventing hotel matches", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: "Makcorps HTTP 400" }, { status: 502 })));
  render(<Harness />);
  fireEvent.click(screen.getByRole("button", { name: "1. Oteli Makcorps’ta ara" }));
  expect(await screen.findByRole("alert")).toHaveProperty("textContent", "Makcorps HTTP 400");
  expect(screen.queryByRole("radio")).toBeNull();
});
it("disables provider calls until setup is available", () => {
  render(<Harness enabled={false} />);
  expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true);
});
