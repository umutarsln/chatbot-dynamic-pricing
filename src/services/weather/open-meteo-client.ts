import type { WeatherRegion } from "@/data/weather-regions";

export type WeatherReport = {
  region: WeatherRegion;
  fetchedAt: string;
  current: {
    time: string;
    temperature: number | null;
    feelsLike: number | null;
    humidity: number | null;
    windSpeed: number | null;
    code: number | null;
  };
  days: {
    date: string;
    code: number | null;
    min: number | null;
    max: number | null;
    rainProbability: number | null;
    rainAmount: number | null;
  }[];
};

/** Rejects anything that is not a plain JSON object from the provider. */
function object(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Invalid weather response");
  }
  return value as Record<string, unknown>;
}

/** Accepts null or a finite number inside the given range. */
function number(value: unknown, min = -Infinity, max = Infinity): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value) || value < min || value > max) {
    throw new Error("Invalid weather value");
  }
  return value;
}

/** Maps an Open-Meteo forecast payload onto the app report, or throws. */
export function parseWeather(payload: unknown, region: WeatherRegion): WeatherReport {
  const data = object(payload);
  if (data.timezone !== "Europe/Istanbul" || data.utc_offset_seconds !== 10800) {
    throw new Error("Invalid weather timezone");
  }
  const current = object(data.current);
  const daily = object(data.daily);
  if (typeof current.time !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(current.time) || !Number.isFinite(Date.parse(`${current.time}+03:00`))) {
    throw new Error("Invalid weather timestamp");
  }
  const times = daily.time;
  if (!Array.isArray(times) || times.length === 0 || times.length > 7) {
    throw new Error("Missing weather forecast");
  }
  const fields = ["weather_code", "temperature_2m_min", "temperature_2m_max", "precipitation_probability_max", "precipitation_sum"] as const;
  for (const field of fields) {
    if (!Array.isArray(daily[field]) || daily[field].length !== times.length) {
      throw new Error("Incomplete weather forecast");
    }
  }
  const days = times.map((date: unknown, index: number) => {
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date) {
      throw new Error("Invalid forecast date");
    }
    const value = (field: (typeof fields)[number]) => (daily[field] as unknown[])[index];
    const min = number(value("temperature_2m_min"), -100, 70);
    const max = number(value("temperature_2m_max"), -100, 70);
    if (min !== null && max !== null && min > max) throw new Error("Invalid temperature range");
    return {
      date,
      code: number(value("weather_code"), 0, 99),
      min,
      max,
      rainProbability: number(value("precipitation_probability_max"), 0, 100),
      rainAmount: number(value("precipitation_sum"), 0),
    };
  });
  if (days.some((day, index) => index > 0 && day.date <= days[index - 1].date)) {
    throw new Error("Invalid forecast order");
  }
  return {
    region,
    fetchedAt: new Date().toISOString(),
    current: {
      time: `${current.time}+03:00`,
      temperature: number(current.temperature_2m, -100, 70),
      feelsLike: number(current.apparent_temperature, -120, 100),
      humidity: number(current.relative_humidity_2m, 0, 100),
      windSpeed: number(current.wind_speed_10m, 0),
      code: number(current.weather_code, 0, 99),
    },
    days,
  };
}

/** Loads a 7-day Istanbul-timezone forecast. A key switches to the customer host. */
export async function fetchWeather(region: WeatherRegion, apiKey?: string): Promise<WeatherReport> {
  const url = new URL("/v1/forecast", apiKey ? "https://customer-api.open-meteo.com" : "https://api.open-meteo.com");
  url.search = new URLSearchParams({
    latitude: String(region.latitude),
    longitude: String(region.longitude),
    timezone: "Europe/Istanbul",
    current: "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code",
    daily: "weather_code,temperature_2m_min,temperature_2m_max,precipitation_probability_max,precipitation_sum",
    forecast_days: "7",
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
  }).toString();
  if (apiKey) url.searchParams.set("apikey", apiKey);
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("Weather provider unavailable");
  return parseWeather(await response.json(), region);
}

export type HistoricalWeatherDay = {
  date: string;
  code: number | null;
  min: number | null;
  max: number | null;
  mean: number | null;
  rainAmount: number | null;
  windSpeed: number | null;
};

export function parseHistoricalWeather(payload: unknown, range: { startDate: string; endDate: string }): HistoricalWeatherDay[] {
  const data = object(payload);
  if (data.timezone !== "Europe/Istanbul" || data.utc_offset_seconds !== 10800) throw new Error("Invalid archive timezone");
  const daily = object(data.daily);
  const fields = ["time", "weather_code", "temperature_2m_min", "temperature_2m_max", "temperature_2m_mean", "precipitation_sum", "wind_speed_10m_max"] as const;
  const count = (Date.parse(range.endDate) - Date.parse(range.startDate)) / 86_400_000 + 1;
  if (!Number.isInteger(count) || count < 1 || count > 366) throw new Error("Invalid archive range");
  for (const field of fields) {
    if (!Array.isArray(daily[field]) || daily[field].length !== count) throw new Error("Incomplete archive response");
  }
  return Array.from({ length: count }, (_, index) => {
    const value = (field: (typeof fields)[number]) => (daily[field] as unknown[])[index];
    const date = new Date(Date.parse(range.startDate) + index * 86_400_000).toISOString().slice(0, 10);
    if (value("time") !== date) throw new Error("Invalid archive date order");
    const min = number(value("temperature_2m_min"), -100, 70);
    const max = number(value("temperature_2m_max"), -100, 70);
    const mean = number(value("temperature_2m_mean"), -100, 70);
    if (min === null || max === null || mean === null || min > max || mean < min || mean > max) throw new Error("Incomplete archive temperatures");
    const code = number(value("weather_code"), 0, 99);
    if (code !== null && !Number.isInteger(code)) throw new Error("Invalid archive weather code");
    return { date, code, min, max, mean, rainAmount: number(value("precipitation_sum"), 0), windSpeed: number(value("wind_speed_10m_max"), 0) };
  });
}

export async function fetchHistoricalWeather(region: WeatherRegion, range: { startDate: string; endDate: string }, apiKey?: string) {
  const url = new URL("/v1/archive", apiKey ? "https://customer-archive-api.open-meteo.com" : "https://archive-api.open-meteo.com");
  url.search = new URLSearchParams({
    latitude: String(region.latitude), longitude: String(region.longitude),
    start_date: range.startDate, end_date: range.endDate, timezone: "Europe/Istanbul", models: "era5",
    daily: "weather_code,temperature_2m_min,temperature_2m_max,temperature_2m_mean,precipitation_sum,wind_speed_10m_max",
    temperature_unit: "celsius", wind_speed_unit: "kmh", precipitation_unit: "mm",
  }).toString();
  if (apiKey) url.searchParams.set("apikey", apiKey);
  const response = await fetch(url, { headers: { Accept: "application/json" }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error("Weather archive unavailable");
  return parseHistoricalWeather(await response.json(), range);
}
