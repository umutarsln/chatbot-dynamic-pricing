import { parseCandidates, parseQuotes, PilotError, type Stay } from "./makcorps-contract";

async function request(path: "mapping" | "hotel", params: Record<string, string>, apiKey: string) {
  const url = new URL(`https://api.makcorps.com/${path}`);
  url.search = new URLSearchParams({ ...params, api_key: apiKey }).toString();
  try {
    const response = await fetch(url, { cache: "no-store", redirect: "error", signal: AbortSignal.timeout(30000) });
    if (response.status === 429) throw new PilotError("Makcorps istek veya kredi sınırına ulaşıldı. Hesabınızı kontrol edin.", 429);
    if (!response.ok) throw new PilotError(`Makcorps isteği tamamlanamadı (HTTP ${response.status}). Hesap erişimini ve kredileri kontrol edin.`, 502);
    return await response.json() as unknown;
  } catch (error) {
    if (error instanceof PilotError) throw error;
    // Fetch errors can contain the credential-bearing URL; never forward them.
    throw new PilotError("Makcorps yanıtı alınamadı. Otomatik tekrar yapılmadı.", 502);
  }
}

export async function findHotel(name: string, apiKey: string) {
  return parseCandidates(await request("mapping", { name }, apiKey));
}

export async function fetchHotelRates(hotelId: string, stay: Stay, apiKey: string) {
  return parseQuotes(await request("hotel", { hotelid: hotelId, checkin: stay.checkin, checkout: stay.checkout, adults: String(stay.adults), rooms: String(stay.rooms), cur: stay.currency }, apiKey));
}
