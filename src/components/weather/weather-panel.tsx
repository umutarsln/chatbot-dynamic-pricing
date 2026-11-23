"use client";

import { useEffect, useRef, useState } from "react";
import { weatherRegions } from "@/data/weather-regions";
import type { WeatherReport } from "@/services/weather/open-meteo-client";

import { dayFormat, weekdayFormat, timeFormat, format, weatherDescription } from "./weather-format";

type Result = { key: string; data: WeatherReport } | { key: string; error: string };

/** Renders the Antalya forecast and refetches when the region or retry changes. */
export function WeatherPanel() {
  const [region, setRegion] = useState("antalya");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const request = useRef<{ key: string; promise: Promise<WeatherReport> } | null>(null);
  const key = `${region}:${attempt}`;

  useEffect(() => {
    // Reuse the request when development Strict Mode replays the mount effect.
    if (request.current?.key !== key) {
      const promise = fetch(`/api/weather?region=${encodeURIComponent(region)}`, { signal: AbortSignal.timeout(15000) })
        .then(async (response) => {
          if (!response.ok) throw new Error("Weather unavailable");
          return await response.json() as WeatherReport;
        });
      request.current = { key, promise };
    }
    let active = true;
    request.current.promise.then(
      (data) => { if (active) setResult({ key, data }); },
      () => { if (active) setResult({ key, error: "Hava durumu alınamadı. Bağlantınızı kontrol edip tekrar deneyin." }); },
    );
    return () => { active = false; };
  }, [region, key]);

  const selected = weatherRegions.find((item) => item.id === region)!;
  const currentResult = result?.key === key ? result : null;
  const report = currentResult && "data" in currentResult ? currentResult.data : null;
  const error = currentResult && "error" in currentResult ? currentResult.error : null;
  const loading = !currentResult;

  return (
    <section className="panel weather-panel" id="weather" aria-labelledby="weather-title" aria-busy={loading}>
      <div className="panel-heading">
        <div><h2 id="weather-title">Hava durumu</h2><p>Antalya · fiyat kararlarınız için 7 günlük tahmin</p></div>
        <label className="weather-region">Bölge<select aria-label="Hava durumu bölgesi" value={region} onChange={(event) => setRegion(event.target.value)}>{weatherRegions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      </div>
      {loading && <div className="weather-loading" role="status"><span className="weather-skeleton" /><p>{selected.name} için hava durumu alınıyor…</p></div>}
      {error && <div className="weather-error" role="alert"><p>{error}</p><button className="button secondary" onClick={() => setAttempt((value) => value + 1)}>Tekrar dene</button></div>}
      {report && <>
        <div className="weather-current">
          <div className="weather-temperature"><strong>{format(report.current.temperature, "°")}</strong><div><b>{selected.name}</b><p>{weatherDescription(report.current.code)}</p></div></div>
          <dl className="weather-details"><div><dt>Hissedilen</dt><dd>{format(report.current.feelsLike, "°C")}</dd></div><div><dt>Rüzgâr</dt><dd>{format(report.current.windSpeed, " km/sa")}</dd></div><div><dt>Nem</dt><dd>{format(report.current.humidity, "%")}</dd></div></dl>
        </div>
        <div className="weather-forecast">{report.days.map((day) => <article className="weather-day" key={day.date}><div><strong>{dayFormat.format(new Date(`${day.date}T12:00:00+03:00`))}</strong><span>{weekdayFormat.format(new Date(`${day.date}T12:00:00+03:00`))}</span></div><p className="weather-condition">{weatherDescription(day.code)}</p><p className="weather-range"><b>{format(day.max, "°")}</b><span>{format(day.min, "°")}</span><span className="sr-only">günlük en yüksek / en düşük</span></p><p className="weather-rain">Yağış {format(day.rainProbability, "%")}<small>{format(day.rainAmount, " mm")}</small></p></article>)}</div>
        <div className="weather-source"><span>Model zamanı: {timeFormat.format(new Date(report.current.time))} TSİ</span><a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Hava verisi: Open-Meteo ↗</a></div>
      </>}
      <p className="weather-note">Bölge merkezinin model tahminidir. Hava verisi fiyatları otomatik değiştirmez.</p>
    </section>
  );
}
