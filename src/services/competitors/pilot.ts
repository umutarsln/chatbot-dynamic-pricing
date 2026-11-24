import "server-only";
import { pilotHotels } from "@/data/pilot-hotels";
import { findHotel, fetchHotelRates } from "./makcorps-client";
import { PilotError, validateStay, matchHotel, type HotelCandidate, type HotelPrices, type PricesReport, type Stay } from "./makcorps-contract";

// Local pilot only: restart clears the request budget and transient mapping IDs.
const state = globalThis as typeof globalThis & { makcorpsPilot?: { started: number; count: number; busy: boolean; candidates: Map<string, { at: number; ids: string[] }>; confirmed?: Map<string, { at: number; id: string }> }; makcorpsPrices?: Map<string, Promise<PricesReport>> };
function getState() {
  return state.makcorpsPilot ??= { started: Date.now(), count: 0, busy: false, candidates: new Map(), confirmed: new Map() };
}

export async function runPilot(body: Record<string, unknown>) {
  const key = process.env.MAKCORPS_API_KEY?.trim();
  if (!key) throw new PilotError("Makcorps API anahtarı henüz tanımlı değil.", 503);
  const hotel = pilotHotels.find((hotel) => hotel.id === body.hotel);
  if (!hotel || (body.action !== "mapping" && body.action !== "rates")) throw new PilotError("Geçerli bir pilot oteli ve işlem seçin.");
  const current = getState();
  const stay = body.action === "rates" ? validateStay(body) : null;
  if (stay) {
    const mapping = current.candidates.get(hotel.id);
    if (typeof body.hotelId !== "string" || !mapping || Date.now() - mapping.at > 30 * 60000 || !mapping.ids.includes(body.hotelId) || body.addressConfirmed !== true) throw new PilotError("Önce oteli arayın ve adresiyle eşleşen kaydı onaylayın.");
  }
  if (current.busy) throw new PilotError("Bir Makcorps isteği sürüyor. Tamamlanmasını bekleyin.", 429);
  if (Date.now() - current.started >= 3600000) { current.started = Date.now(); current.count = 0; }
  if (current.count >= 20) throw new PilotError("Yerel pilotun saatlik 20 istek sınırına ulaşıldı.", 429);
  current.count++;
  current.busy = true;
  try {
    if (!stay) {
      const name = hotel.name.includes("Antalya") ? hotel.name : `${hotel.name} Antalya`;
      const candidates: HotelCandidate[] = await findHotel(name, key);
      current.candidates.set(hotel.id, { at: Date.now(), ids: candidates.map((candidate) => candidate.id) });
      return { candidates };
    }
    const quotes = await fetchHotelRates(body.hotelId as string, stay, key);
    (current.confirmed ??= new Map()).set(hotel.id, { at: current.candidates.get(hotel.id)!.at, id: body.hotelId as string });
    return { hotelId: body.hotelId, stay, fetchedAt: new Date().toISOString(), quotes };
  } finally { current.busy = false; }
}

export async function getHotelPrices(body: Record<string, unknown>): Promise<PricesReport> {
  const stay = validateStay(body);
  if (!Array.isArray(body.hotels) || !body.hotels.length || body.hotels.length > pilotHotels.length || new Set(body.hotels).size !== body.hotels.length || body.hotels.some((id) => !pilotHotels.some((hotel) => hotel.id === id))) throw new PilotError("Listeden 1–5 farklı otel seçin.");
  if (!process.env.MAKCORPS_API_KEY?.trim()) throw new PilotError("Makcorps API anahtarı henüz tanımlı değil.", 503);
  const ids = body.hotels as string[];
  const requests = state.makcorpsPrices ??= new Map();
  const requestKey = JSON.stringify([stay, [...ids].sort()]);
  const existing = requests.get(requestKey);
  if (existing) return existing;
  const request = collectPrices(ids, stay).finally(() => requests.delete(requestKey));
  requests.set(requestKey, request);
  return request;
}

async function collectPrices(ids: string[], stay: Stay): Promise<PricesReport> {
  const hotels: HotelPrices[] = [];
  for (const id of ids) {
    const hotel = pilotHotels.find((hotel) => hotel.id === id)!;
    try {
      const current = getState();
      let hotelId = current.confirmed?.get(id)?.id;
      const mapping = current.candidates.get(id);
      if (!mapping || Date.now() - mapping.at > 30 * 60000 || !hotelId || !mapping.ids.includes(hotelId)) {
        const mapped = await runPilot({ action: "mapping", hotel: id });
        const match = matchHotel(hotel, mapped.candidates ?? []);
        if (!match) { hotels.push({ hotel: id, status: "needs-mapping", message: "Ad ve adres eşleşmesi doğrulanmalı." }); continue; }
        hotelId = match.id;
      }
      const result = await runPilot({ action: "rates", hotel: id, hotelId, addressConfirmed: true, ...stay });
      if (!("quotes" in result) || !result.quotes || !result.stay) throw new PilotError("Fiyat yanıtı alınamadı.", 502);
      hotels.push({ hotel: id, status: result.quotes.some((quote) => quote.price !== null || quote.total !== null) ? "ready" : "empty", result: { hotelId, stay: result.stay, quotes: result.quotes, fetchedAt: result.fetchedAt! } });
    } catch (error) {
      hotels.push({ hotel: id, status: "error", message: error instanceof PilotError ? error.message : "Otel fiyatları alınamadı." });
    }
  }
  return { stay, fetchedAt: new Date().toISOString(), hotels };
}
