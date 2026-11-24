import "server-only";
import { pilotHotels } from "@/data/pilot-hotels";
import { findHotel, fetchHotelRates } from "./makcorps-client";
import { PilotError, validateStay, type HotelCandidate } from "./makcorps-contract";

// Local pilot only: restart clears the request budget and transient mapping IDs.
const state = globalThis as typeof globalThis & { makcorpsPilot?: { started: number; count: number; busy: boolean; candidates: Map<string, { at: number; ids: string[] }> } };
function getState() {
  return state.makcorpsPilot ??= { started: Date.now(), count: 0, busy: false, candidates: new Map() };
}

export async function runPilot(body: Record<string, unknown>) {
  const key = process.env.MAKCORPS_API_KEY?.trim();
  if (!key) throw new PilotError("Makcorps API anahtarı henüz tanımlı değil. Kurulum adımlarını inceleyin.", 503);
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
    return { hotelId: body.hotelId, stay, fetchedAt: new Date().toISOString(), quotes };
  } finally { current.busy = false; }
}
