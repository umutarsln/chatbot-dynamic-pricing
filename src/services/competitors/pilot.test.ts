import { afterEach, expect, it, vi } from "vitest";
import { getHotelPrices } from "./pilot";
import { defaultStay } from "./makcorps-contract";

afterEach(() => {
  const state = globalThis as typeof globalThis & { makcorpsPilot?: unknown; makcorpsPrices?: unknown };
  delete state.makcorpsPilot; delete state.makcorpsPrices;
  vi.unstubAllGlobals(); vi.unstubAllEnvs();
});

it("shares an in-flight query across simultaneous page landings, without caching completed prices", async () => {
  vi.stubEnv("MAKCORPS_API_KEY", "test-secret");
  const payload = { action: "prices", hotels: ["akra"], ...defaultStay() };
  let release!: (response: Response) => void;
  const fetcher = vi.fn().mockImplementationOnce(() => new Promise<Response>((resolve) => { release = resolve; }))
    .mockImplementation(() => Promise.resolve(Response.json({ comparison: [[{ vendor1: "Test OTA", price1: "TRY 120" }]] })));
  vi.stubGlobal("fetch", fetcher);
  const first = getHotelPrices(payload);
  const second = getHotelPrices(payload);
  expect(fetcher).toHaveBeenCalledTimes(1);
  release(Response.json([{ type: "HOTEL", document_id: "123", name: "Akra Hotel, Antalya", details: { address: "Lara Cad No 24", geo_name: "Antalya" } }]));
  const [a, b] = await Promise.all([first, second]);
  expect(a).toEqual(b);
  expect(a.hotels[0]).toMatchObject({ status: "ready" });
  expect(fetcher).toHaveBeenCalledTimes(2);
  await getHotelPrices(payload);
  expect(fetcher).toHaveBeenCalledTimes(3);
});
