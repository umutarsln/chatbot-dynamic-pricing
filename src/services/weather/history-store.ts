import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import type { WeatherRegion } from "@/data/weather-regions";
import type { HistoricalWeatherDay } from "./open-meteo-client";
import type { HistoryRange } from "./history-range";

function openStore(path: string) {
  mkdirSync(dirname(path), { recursive: true });
  const db = new DatabaseSync(path);
  try {
    db.exec(`PRAGMA busy_timeout=5000; PRAGMA journal_mode=WAL;
      CREATE TABLE IF NOT EXISTS weather_history_era5 (
        region_id TEXT NOT NULL, latitude REAL NOT NULL, longitude REAL NOT NULL, date TEXT NOT NULL,
        code INTEGER, min REAL, max REAL, mean REAL, rain_amount REAL, wind_speed REAL, fetched_at TEXT NOT NULL,
        PRIMARY KEY (region_id, latitude, longitude, date)
      ) STRICT;`);
    return db;
  } catch (error) {
    db.close();
    throw error;
  }
}

export function readStoredHistory(path: string, region: WeatherRegion, range: HistoryRange) {
  const db = openStore(path);
  try {
    const scope = [region.id, region.latitude, region.longitude];
    const rows = db.prepare(`SELECT date, code, min, max, mean, rain_amount, wind_speed, fetched_at
      FROM weather_history_era5 WHERE region_id=? AND latitude=? AND longitude=? AND date BETWEEN ? AND ? ORDER BY date`).all(...scope, range.startDate, range.endDate);
    const days = rows.map((row) => ({
      date: row.date as string, code: row.code as number | null,
      min: row.min as number | null, max: row.max as number | null, mean: row.mean as number | null,
      rainAmount: row.rain_amount as number | null, windSpeed: row.wind_speed as number | null,
      fetchedAt: row.fetched_at as string,
    }));
    const totals = db.prepare("SELECT COUNT(*) AS count, MIN(date) AS first, MAX(date) AS last FROM weather_history_era5 WHERE region_id=? AND latitude=? AND longitude=?").get(...scope)!;
    return { days, totalStored: Number(totals.count), firstStoredDate: totals.first as string | null, lastStoredDate: totals.last as string | null };
  } finally {
    db.close();
  }
}

export function saveHistoricalDays(path: string, region: WeatherRegion, days: HistoricalWeatherDay[]) {
  const db = openStore(path);
  try {
    const insert = db.prepare(`INSERT INTO weather_history_era5
      (region_id, latitude, longitude, date, code, min, max, mean, rain_amount, wind_speed, fetched_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`);
    let saved = 0;
    const fetchedAt = new Date().toISOString();
    db.exec("BEGIN IMMEDIATE");
    try {
      for (const day of days) {
        saved += Number(insert.run(region.id, region.latitude, region.longitude, day.date, day.code, day.min, day.max, day.mean, day.rainAmount, day.windSpeed, fetchedAt).changes);
      }
      db.exec("COMMIT");
      return saved;
    } catch (error) {
      db.exec("ROLLBACK");
      throw error;
    }
  } finally {
    db.close();
  }
}
