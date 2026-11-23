"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { weatherRegions } from "@/data/weather-regions";
import type { WeatherHistoryReport } from "@/services/weather/weather-history";
import { format, weatherDescription, timeFormat } from "./weather-format";

const dateFormat = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Istanbul" });
type Result = { key: string; report: WeatherHistoryReport } | { key: string; error: string };

export default function WeatherHistory() {
  const [region, setRegion] = useState("antalya");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState("");
  const request = useRef<{ key: string; promise: Promise<WeatherHistoryReport> } | null>(null);
  const key = `${region}:${attempt}`;

  useEffect(() => {
    if (request.current?.key !== key) {
      request.current = { key, promise: fetch(`/api/weather/history?region=${encodeURIComponent(region)}`, { cache: "no-store", signal: AbortSignal.timeout(15000) })
        .then(async (response) => {
          if (!response.ok) throw new Error("History unavailable");
          return await response.json() as WeatherHistoryReport;
        }) };
    }
    let active = true;
    request.current.promise.then((report) => {
      if (active) {
        setResult({ key, report });
        setImportError("");
      }
    }, () => {
      if (active) setResult({ key, error: "Kayıtlı hava verileri okunamadı. Lütfen tekrar deneyin." });
    });
    return () => { active = false; };
  }, [region, key]);

  const current = result?.key === key ? result : null;
  const report = current && "report" in current ? current.report : null;
  const error = current && "error" in current ? current.error : null;

  async function importHistory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const startDate = values.get("startDate");
    const endDate = values.get("endDate");
    setImporting(true);
    setImportError("");
    try {
      const response = await fetch("/api/weather/history", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ region, startDate, endDate }), signal: AbortSignal.timeout(30000),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Geçmiş veri alınamadı.");
      setResult({ key, report: payload as WeatherHistoryReport });
    } catch (error) {
      setImportError(error instanceof Error && error.name !== "TimeoutError" ? error.message : "Aktarım zaman aşımına uğradı. Tekrar deneyebilirsiniz.");
    } finally {
      setImporting(false);
    }
  }

  const temperatures = report?.days.flatMap((day) => day.mean === null ? [] : [day.mean]) ?? [];
  const rain = report?.days.flatMap((day) => day.rainAmount === null ? [] : [day.rainAmount]) ?? [];
  const average = temperatures.length ? temperatures.reduce((sum, value) => sum + value, 0) / temperatures.length : null;
  const rainfall = rain.length ? rain.reduce((sum, value) => sum + value, 0) : null;

  return <section className="panel weather-history-panel" aria-labelledby="history-title" aria-busy={!current || importing}>
    <div className="panel-heading"><div><h2 id="history-title">Geçmiş hava arşivi</h2><p>Antalya · günlük sıcaklık, yağış ve rüzgâr kayıtları</p></div><label className="weather-region">Bölge<select aria-label="Arşiv bölgesi" value={region} disabled={importing} onChange={(event) => setRegion(event.target.value)}>{weatherRegions.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
    {!current && <p className="history-message" role="status">Kayıtlı veriler okunuyor…</p>}
    {error && <div className="weather-error" role="alert"><p>{error}</p><button className="button secondary" onClick={() => setAttempt((value) => value + 1)}>Tekrar dene</button></div>}
    {report && <>
      <form className="history-form" key={`${region}:${report.startDate}:${report.endDate}`} onSubmit={importHistory}>
        <label>Başlangıç<input aria-label="Arşiv başlangıç tarihi" type="date" name="startDate" required min={report.earliestDate} max={report.latestDate} defaultValue={report.startDate} disabled={importing} /></label>
        <label>Bitiş<input aria-label="Arşiv bitiş tarihi" type="date" name="endDate" required min={report.earliestDate} max={report.latestDate} defaultValue={report.endDate} disabled={importing} /></label>
        <button className="button primary" type="submit" disabled={importing}>{importing ? "Alınıyor ve kaydediliyor…" : "Getir ve kaydet"}</button>
      </form>
      <p className="source-note">{report.latestDate} tarihine kadar veri alınabilir. Tek seferde en fazla 366 gün; yalnızca eksik günler sağlayıcıdan alınır.</p>
      {importError && <p className="history-message history-error" role="alert">{importError}</p>}
      <div className="history-stats"><div><span>Bölgede kayıtlı</span><strong>{report.totalStored.toLocaleString("tr-TR")} gün</strong></div><div><span>Kayıtlı gün ortalaması</span><strong>{format(average, "°C")}</strong></div><div><span>Kayıtlı günlerin yağışı</span><strong>{format(rainfall, " mm")}</strong></div></div>
      <div className="panel-heading history-range"><p>Gösterilen aralık: <strong>{report.startDate} → {report.endDate}</strong> · {report.days.length} / {report.expectedDays} gün</p><span className="count-badge">Open-Meteo · ERA5</span></div>
      {report.days.length > 0 ? <>
        <p className="source-note" role="status">{report.savedDays > 0 ? `${report.savedDays} yeni gün kalıcı arşive kaydedildi.` : report.days.length < report.expectedDays ? `${report.expectedDays - report.days.length} gün eksik. Getir ve kaydet ile tamamlayabilirsiniz.` : "Kayıtlar kalıcı arşivden okundu."}</p>
        <div className="history-table-scroll"><table className="rate-table history-table"><caption className="sr-only">{report.region.name} geçmiş hava verileri</caption><thead><tr><th scope="col">Tarih</th><th scope="col">Durum</th><th scope="col">En düşük</th><th scope="col">Ortalama</th><th scope="col">En yüksek</th><th scope="col">Yağış</th><th scope="col">Maks. rüzgâr</th></tr></thead><tbody>{report.days.map((day) => <tr key={day.date}><th scope="row">{dateFormat.format(new Date(`${day.date}T12:00:00+03:00`))}</th><td>{weatherDescription(day.code)}</td><td>{format(day.min, "°")}</td><td>{format(day.mean, "°")}</td><td>{format(day.max, "°")}</td><td>{format(day.rainAmount, " mm")}</td><td>{format(day.windSpeed, " km/sa")}</td></tr>)}</tbody></table></div>
        <p className="source-note">Kayıt zamanı: {timeFormat.format(new Date(report.days[0].fetchedAt))} TSİ · Bölge arşivi: {report.firstStoredDate} → {report.lastStoredDate}</p>
      </> : <p className="history-message">Bu tarih aralığında kayıt yok. Getir ve kaydet ile arşive ekleyebilirsiniz.</p>}
      <p className="weather-note">ERA5 yeniden analiz verisidir; istasyon ölçümü veya geçmişte yayınlanan tahmin değildir. Tarihler Europe/Istanbul zaman dilimindedir. <a href="https://open-meteo.com/en/docs/historical-weather-api" target="_blank" rel="noreferrer">Kaynak: Open-Meteo ↗</a></p>
    </>}
  </section>;
}
