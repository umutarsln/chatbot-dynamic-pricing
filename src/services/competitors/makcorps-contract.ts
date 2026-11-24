export type HotelCandidate = { id: string; name: string; address: string; location: string };
export type VendorQuote = { vendor: string; price: string | null; tax: string | null; total: string | null };
export type Stay = { checkin: string; checkout: string; adults: number; rooms: number; currency: "TRY" | "EUR" | "USD" };
export type RateResult = { hotelId: string; stay: Stay; fetchedAt: string; quotes: VendorQuote[] };

export class PilotError extends Error {
  status: number;
  constructor(message: string, status = 400) { super(message); this.status = status; }
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function text(value: unknown): string | null {
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return typeof value === "string" && value.trim() ? value.trim().slice(0, 240) : null;
}

export function parseCandidates(payload: unknown): HotelCandidate[] {
  if (!Array.isArray(payload)) throw new PilotError("Makcorps eşleştirme yanıtı beklenen biçimde değil.", 502);
  const result = new Map<string, HotelCandidate>();
  for (const item of payload) {
    if (!record(item) || item.type !== "HOTEL") continue;
    const id = text(item.document_id);
    const name = text(item.name);
    if (!id || !/^\d{1,20}$/.test(id) || !name) continue;
    const details = record(item.details) ? item.details : {};
    result.set(id, { id, name, address: text(details.address) ?? "", location: text(details.geo_name) ?? text(details.parent_name) ?? "" });
  }
  return [...result.values()].slice(0, 10);
}

export function parseQuotes(payload: unknown): VendorQuote[] {
  if (!record(payload) || !Array.isArray(payload.comparison)) throw new PilotError("Makcorps fiyat yanıtı beklenen biçimde değil.", 502);
  const result: VendorQuote[] = [];
  // The provider groups indexed fields inside nested comparison arrays.
  for (const group of payload.comparison) {
    if (!Array.isArray(group)) throw new PilotError("Makcorps fiyat yanıtı beklenen biçimde değil.", 502);
    for (const item of group) {
      if (!record(item)) continue;
      for (const key of Object.keys(item)) {
        const match = /^vendor(\d+)$/.exec(key);
        const vendor = match && text(item[key]);
        if (!vendor) continue;
        const index = match![1];
        result.push({ vendor, price: text(item[`price${index}`]), tax: text(item[`tax${index}`]), total: text(item[`Totalprice${index}`]) ?? text(item[`totalprice${index}`]) });
      }
    }
  }
  return result.slice(0, 50);
}

export function validateStay(value: Record<string, unknown>, now = new Date()): Stay {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const validDate = (date: unknown): date is string => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date;
  const { checkin, checkout, adults, rooms, currency } = value;
  if (!validDate(checkin) || !validDate(checkout) || checkin < today || checkout <= checkin || (Date.parse(checkout) - Date.parse(checkin)) / 86400000 > 14 || Date.parse(checkin) - Date.parse(today) > 365 * 86400000) throw new PilotError("Bugünden itibaren bir yıl içinde, 1–14 gecelik geçerli bir tarih aralığı seçin.");
  if (!Number.isInteger(adults) || (adults as number) < 1 || (adults as number) > 4 || rooms !== 1) throw new PilotError("Pilot için 1 oda ve 1–4 yetişkin seçin.");
  if (currency !== "TRY" && currency !== "EUR" && currency !== "USD") throw new PilotError("TRY, EUR veya USD seçin.");
  return { checkin, checkout, adults: adults as number, rooms, currency };
}

export function guardPilotRequest(request: Request, production: boolean) {
  if (production) throw new PilotError("Bu pilot yalnızca yerel geliştirme ortamında kullanılabilir.", 403);
  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  try {
    const target = new URL(`http://${host}`);
    const source = new URL(origin ?? "");
    if (!host || !["localhost", "127.0.0.1", "[::1]"].includes(target.hostname) || source.host !== host || source.protocol !== "http:") throw new Error();
  } catch { throw new PilotError("Pilot için aynı yerel kaynaktan istek gerekli.", 403); }
}
