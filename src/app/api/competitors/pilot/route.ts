import { guardPilotRequest, PilotError } from "@/services/competitors/makcorps-contract";
import { runPilot } from "@/services/competitors/pilot";

const headers = { "Cache-Control": "no-store" };

export async function GET(request: Request) {
  // Reading the request keeps configuration out of the build-time cache.
  void request.url;
  return Response.json({ configured: !!process.env.MAKCORPS_API_KEY?.trim(), local: process.env.NODE_ENV !== "production" }, { headers });
}

export async function POST(request: Request) {
  try {
    guardPilotRequest(request, process.env.NODE_ENV === "production");
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new PilotError("JSON gövdesi gerekli.", 415);
    const reader = request.body?.getReader();
    if (!reader) throw new PilotError("İstek gövdesi gerekli.");
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 2048) { await reader.cancel(); throw new PilotError("İstek çok büyük.", 413); }
      chunks.push(chunk.value);
    }
    let body: unknown;
    try { body = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { throw new PilotError("Geçersiz JSON."); }
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new PilotError("Geçersiz istek.");
    return Response.json(await runPilot(body as Record<string, unknown>), { headers });
  } catch (error) {
    if (error instanceof PilotError) return Response.json({ error: error.message }, { status: error.status, headers: { ...headers, ...(error.status === 429 ? { "Retry-After": "60" } : {}) } });
    return Response.json({ error: "Pilot isteği tamamlanamadı." }, { status: 500, headers });
  }
}
