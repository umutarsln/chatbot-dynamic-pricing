// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { PilotQuotes } from "./pilot-quotes";

afterEach(cleanup);
const result = { hotelId: "123", stay: { checkin: "2026-12-01", checkout: "2026-12-02", adults: 2, rooms: 1, currency: "TRY" as const }, fetchedAt: "2026-11-24T10:00:00Z", quotes: [{ vendor: "Test OTA", price: "TRY 325", tax: null, total: null }] };
it("preserves missing fields and query context without inventing totals", () => {
  render(<PilotQuotes result={result} />);
  expect(screen.getByText("TRY 325")).toBeDefined();
  expect(screen.getAllByText("Dönmedi")).toHaveLength(2);
  expect(screen.getByText(/2026-12-01 → 2026-12-02/)).toBeDefined();
});
it("requires matching conditions before declaring rates consistent", () => {
  render(<PilotQuotes result={result} />);
  const option = screen.getByRole("option", { name: "Kontrol edilen fiyatlar tutarlı" }) as HTMLOptionElement;
  expect(option.disabled).toBe(true);
  fireEvent.click(screen.getByRole("checkbox"));
  expect(option.disabled).toBe(false);
  const verdict = screen.getByRole("combobox") as HTMLSelectElement;
  fireEvent.change(verdict, { target: { value: "match" } });
  expect(verdict.value).toBe("match");
  fireEvent.click(screen.getByRole("checkbox"));
  expect(verdict.value).toBe("pending");
  expect(option.disabled).toBe(true);
});
