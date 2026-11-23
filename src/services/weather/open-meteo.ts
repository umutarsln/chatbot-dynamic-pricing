import "server-only";
import type { WeatherRegion } from "@/data/weather-regions";
import { fetchWeather } from "./open-meteo-client";

/** Keeps the provider key on the server; the forecast client stays key-agnostic. */
export function getWeather(region: WeatherRegion) {
  return fetchWeather(region, process.env.OPEN_METEO_API_KEY?.trim() || undefined);
}
