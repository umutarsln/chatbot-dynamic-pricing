import { weatherRegions } from "@/data/weather-regions";
import { getWeather } from "@/services/weather/open-meteo";

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const regionId = params.get("region") ?? "antalya";
  const region = weatherRegions.find((item) => item.id === regionId);
  if (!region || params.getAll("region").length > 1) {
    return Response.json({ error: "Geçerli bir Antalya bölgesi seçin." }, { status: 400 });
  }
  try {
    const report = await getWeather(region);
    return Response.json(report, { headers: { "Cache-Control": "public, max-age=300, s-maxage=900" } });
  } catch {
    return Response.json({ error: "Hava durumu şu anda alınamıyor. Lütfen tekrar deneyin." }, {
      status: 502,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
