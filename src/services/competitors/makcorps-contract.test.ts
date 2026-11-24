import { describe, expect, it } from "vitest";
import { guardPilotRequest, parseCandidates, parseQuotes, validateStay } from "./makcorps-contract";

describe("hotel matching", () => {
  it("retains addresses and IDs, excludes cities and malformed records without choosing a hotel", () => {
    expect(parseCandidates([{ type: "GEO", document_id: "1", name: "Antalya" }, { type: "HOTEL", document_id: "123", name: "Test Hotel", details: { address: "Test Street 2", geo_name: "Antalya" } }, { type: "HOTEL", document_id: "123", name: "Test Hotel", details: { address: "Test Street 2", geo_name: "Antalya" } }, { type: "HOTEL", document_id: "bad", name: "Invalid" }])).toEqual([{ id: "123", name: "Test Hotel", address: "Test Street 2", location: "Antalya" }]);
  });
  it("allows absent addresses without inventing them", () => expect(parseCandidates([{ type: "HOTEL", document_id: 123, name: "Test" }])[0].address).toBe(""));
  it("rejects provider error objects", () => expect(() => parseCandidates({ error: "No credits" })).toThrow());
});
describe("rate data", () => {
  it("reads both documented indexed layouts, preserves raw currency, taxes and nulls", () => {
    expect(parseQuotes({ comparison: [[{ vendor1: "OTA One", price1: "$325", tax1: "$53" }, { vendor2: "OTA Two", price2: null, tax2: null }, { vendor3: "OTA Three", price3: "1.234,50 TL", Totalprice3: "1.300,50 TL", vendor4: "OTA Four", price4: 0 }]] })).toEqual([
      { vendor: "OTA One", price: "$325", tax: "$53", total: null }, { vendor: "OTA Two", price: null, tax: null, total: null }, { vendor: "OTA Three", price: "1.234,50 TL", tax: null, total: "1.300,50 TL" }, { vendor: "OTA Four", price: "0", tax: null, total: null },
    ]);
  });
  it("distinguishes empty results from provider failures", () => {
    expect(parseQuotes({ comparison: [] })).toEqual([]);
    expect(() => parseQuotes({ error: "Invalid key" })).toThrow();
    expect(() => parseQuotes({ comparison: [{}] })).toThrow();
  });
});
describe("stay validation", () => {
  const now = new Date("2026-11-23T22:00:00Z");
  const stay = { checkin: "2026-11-24", checkout: "2026-11-25", adults: 2, rooms: 1, currency: "TRY" };
  it("uses the current Istanbul day", () => expect(validateStay(stay, now)).toEqual(stay));
  it.each([{ checkin: "2026-11-23" }, { checkin: "2026-02-30" }, { checkout: "2026-11-24" }, { checkout: "2026-12-15" }, { checkin: "2028-11-24", checkout: "2028-11-25" }, { adults: 0 }, { adults: 1.5 }, { rooms: 2 }, { currency: "INVALID" }])("rejects invalid conditions %j", (change) => expect(() => validateStay({ ...stay, ...change }, now)).toThrow());
});
describe("local pilot boundary", () => {
  const request = (origin: string | null, host = "localhost:3005") => new Request("http://localhost:3005/api/competitors/pilot", { headers: { host, ...(origin ? { origin } : {}) } });
  it("allows an explicit same-origin local request", () => expect(() => guardPilotRequest(request("http://localhost:3005"), false)).not.toThrow());
  it.each([null, "https://attacker.test", "http://localhost:3006", "null"])("rejects missing or foreign origin %s", (origin) => expect(() => guardPilotRequest(request(origin), false)).toThrow());
  it("rejects non-local hosts", () => expect(() => guardPilotRequest(request("http://public.test", "public.test"), false)).toThrow());
  it("always disables paid actions in production", () => expect(() => guardPilotRequest(request("http://localhost:3005"), true)).toThrow());
});
