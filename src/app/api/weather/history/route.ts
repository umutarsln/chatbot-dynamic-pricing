import { weatherRegions } from "@/data/weather-regions";
import { getHistoryBounds, HistoryRangeError, validateHistoryRange } from "@/services/weather/history-range";
import { getStoredWeatherHistory, importWeatherHistory, WeatherArchiveError } from "@/services/weather/weather-history";

const headers = { "Cache-Control": "no-store" };
function findRegion(value: unknown) {
  const region = weatherRegions.find((item) => item.id === value);
  if (!region) throw new HistoryRangeError("Geçerli bir Antalya bölgesi seçin.");
  return region;
}
function failure(error: unknown) {
  if (error instanceof HistoryRangeError) return Response.json({ error: error.message }, { status: 400, headers });
  if (error instanceof WeatherArchiveError) return Response.json({ error: error.message }, { status: 502, headers });
  return Response.json({ error: "Hava arşivine erişilemiyor. Lütfen tekrar deneyin." }, { status: 500, headers });
}

export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    for (const key of ["region", "startDate", "endDate"]) if (params.getAll(key).length > 1) throw new HistoryRangeError("Tekrarlanan sorgu alanı.");
    const region = findRegion(params.get("region") ?? "antalya");
    const defaults = getHistoryBounds();
    const range = validateHistoryRange(params.get("startDate") ?? defaults.startDate, params.get("endDate") ?? defaults.endDate);
    return Response.json(getStoredWeatherHistory(region, range), { headers });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin) {
    let allowed = false;
    try {
      const source = new URL(origin);
      const host = request.headers.get("host");
      // Next's internal request URL can use localhost even when Host is 127.0.0.1.
      allowed = !!host && ["http:", "https:"].includes(source.protocol)
        && source.origin === new URL(`${source.protocol}//${host}`).origin;
    } catch { /* Invalid origins are rejected. */ }
    if (!allowed) return Response.json({ error: "Bu kaynaktan aktarım yapılamaz." }, { status: 403, headers });
  }
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") return Response.json({ error: "JSON gövdesi gerekli." }, { status: 415, headers });
  if (Number(request.headers.get("content-length")) > 2048) return Response.json({ error: "İstek çok büyük." }, { status: 413, headers });
  let body;
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Missing body");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 2048) {
        await reader.cancel();
        return Response.json({ error: "İstek çok büyük." }, { status: 413, headers });
      }
      chunks.push(chunk.value);
    }
    body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch { return Response.json({ error: "Geçersiz JSON." }, { status: 400, headers }); }
  try {
    if (typeof body !== "object" || body === null || Array.isArray(body)) throw new HistoryRangeError("Geçersiz istek.");
    const region = findRegion(body.region);
    const range = validateHistoryRange(body.startDate, body.endDate);
    return Response.json(await importWeatherHistory(region, range), { headers });
  } catch (error) {
    return failure(error);
  }
}
