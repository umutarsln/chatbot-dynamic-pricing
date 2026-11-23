import "server-only";
import { resolve } from "node:path";
import type { WeatherRegion } from "@/data/weather-regions";
import { fetchHistoricalWeather } from "./open-meteo-client";
import { getHistoryBounds, listHistoryDates, type HistoryRange } from "./history-range";
import { readStoredHistory, saveHistoricalDays } from "./history-store";

export class WeatherArchiveError extends Error {}
const storePath = () => process.env.WEATHER_HISTORY_DB_PATH || resolve(process.cwd(), "var/weather.sqlite");

export function getStoredWeatherHistory(region: WeatherRegion, range: HistoryRange) {
  const stored = readStoredHistory(storePath(), region, range);
  return { region, ...getHistoryBounds(), ...range, model: "ERA5" as const,
    ...stored, expectedDays: listHistoryDates(range).length, savedDays: 0 };
}

export type WeatherHistoryReport = ReturnType<typeof getStoredWeatherHistory>;

export async function importWeatherHistory(region: WeatherRegion, range: HistoryRange): Promise<WeatherHistoryReport> {
  const stored = getStoredWeatherHistory(region, range);
  const existingDates = new Set(stored.days.map((day) => day.date));
  const missing = listHistoryDates(range).filter((date) => !existingDates.has(date));
  if (missing.length === 0) return stored;
  let days;
  try {
    days = await fetchHistoricalWeather(region, { startDate: missing[0], endDate: missing.at(-1)! }, process.env.OPEN_METEO_API_KEY?.trim() || undefined);
  } catch {
    throw new WeatherArchiveError("Geçmiş hava verisi sağlayıcıdan alınamadı. Daha sonra tekrar deneyin.");
  }
  const savedDays = saveHistoricalDays(storePath(), region, days);
  return { ...getStoredWeatherHistory(region, range), savedDays };
}
