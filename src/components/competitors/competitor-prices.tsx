"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { pilotHotels } from "@/data/pilot-hotels";
import { defaultStay, type PricesReport, type Stay } from "@/services/competitors/makcorps-contract";
import { CompetitorPriceTable } from "./competitor-price-table";
import { PilotQuotes } from "./pilot-quotes";

async function fetchPrices(stay: Stay): Promise<PricesReport> {
  const response = await fetch("/api/competitors/pilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "prices", hotels: pilotHotels.map((hotel) => hotel.id), ...stay }), cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Otel fiyatları alınamadı.");
  return data;
}

export default function CompetitorPrices() {
  const [report, setReport] = useState<PricesReport | null>(null);
  const [stay, setStay] = useState<Stay | null>(null);
  const [selected, setSelected] = useState<string[]>(pilotHotels.map((hotel) => hotel.id));
  const [detail, setDetail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const landing = useRef<Promise<PricesReport> | null>(null);
  useEffect(() => {
    let active = true;
    // Reuse the same promise through Strict Mode's effect replay: no second paid batch.
    landing.current ??= fetchPrices(defaultStay());
    landing.current.then((data) => { if (active) { setReport(data); setStay(data.stay); } }).catch((error) => { if (active) { setError(error instanceof Error ? error.message : "Fiyatlar alınamadı."); setStay(defaultStay()); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function refresh() {
    if (!stay || loading) return;
    setLoading(true); setError(""); setDetail(null); setReport(null);
    try { setReport(await fetchPrices(stay)); }
    catch (error) { setError(error instanceof Error ? error.message : "Fiyatlar alınamadı."); }
    finally { setLoading(false); }
  }
  const current = report?.hotels.find((hotel) => hotel.hotel === detail && selected.includes(hotel.hotel));
  const currentHotel = pilotHotels.find((hotel) => hotel.id === current?.hotel);
  return <div className="pilot-page">
    <div className="competitor-links"><Link href="/competitors/setup">Otel eşleştirmeleri</Link></div>
    <section className="panel" aria-labelledby="prices-conditions"><div className="panel-heading"><div><h2 id="prices-conditions">Aynı konaklama, farklı oteller</h2><p>Antalya · 1 oda · çocuk yok · Makcorps</p></div><span className="count-badge">{loading ? "Fiyatlar alınıyor…" : `${report?.hotels.filter((hotel) => hotel.status === "ready").length ?? 0} / 5 otelde fiyat`}</span></div>
      {stay && <form className="history-form pilot-form" onSubmit={(event) => { event.preventDefault(); void refresh(); }}><label>Giriş<input type="date" required value={stay.checkin} disabled={loading} onChange={(event) => setStay({ ...stay, checkin: event.target.value })} /></label><label>Çıkış<input type="date" required value={stay.checkout} disabled={loading} onChange={(event) => setStay({ ...stay, checkout: event.target.value })} /></label><label>Yetişkin<select value={stay.adults} disabled={loading} onChange={(event) => setStay({ ...stay, adults: Number(event.target.value) })}>{[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count} yetişkin</option>)}</select></label><label>Para birimi<select value={stay.currency} disabled={loading} onChange={(event) => setStay({ ...stay, currency: event.target.value as Stay["currency"] })}>{["TRY", "EUR", "USD"].map((code) => <option key={code}>{code}</option>)}</select></label><button className="button primary" disabled={loading}>Tüm fiyatları yenile</button></form>}
      <p className="weather-note">Tüm oteller sayfa açılışında bir kez sorgulanır. Filtreler mevcut sonuçları daraltır. Yenileme yeni API kredisi tüketebilir.</p>
    </section>
    <section className="panel" aria-labelledby="prices-table"><div className="panel-heading"><div><h2 id="prices-table">Otel fiyatları</h2><p>{report ? `${report.stay.checkin} → ${report.stay.checkout} · ${report.stay.adults} yetişkin · ${report.stay.currency} istendi` : "Beş otel için aynı koşullarda kanal fiyatları"}</p></div><button className="button secondary" onClick={() => setSelected(selected.length === pilotHotels.length ? [] : pilotHotels.map((hotel) => hotel.id))}>{selected.length === pilotHotels.length ? "Seçimi temizle" : "Tümünü seç"}</button></div>
      <fieldset className="hotel-filters"><legend>Gösterilecek oteller</legend>{pilotHotels.map((hotel) => <label key={hotel.id}><input type="checkbox" checked={selected.includes(hotel.id)} onChange={(event) => setSelected((previous) => event.target.checked ? [...previous, hotel.id] : previous.filter((id) => id !== hotel.id))} />{hotel.name}</label>)}</fieldset>
      {error && <p className="history-message history-error" role="alert">{error}</p>}
      <div role="status" className="weather-note" aria-live="polite">{loading ? "Tüm otellerin fiyatları alınıyor…" : `${selected.length} otel gösteriliyor.`}</div>
      <CompetitorPriceTable hotels={selected} report={report} loading={loading} failed={!!error} onDetails={setDetail} />
      {report && <p className="weather-note">Sorgu tamamlandı: {new Intl.DateTimeFormat("tr-TR", { timeZone: "Europe/Istanbul", dateStyle: "short", timeStyle: "short" }).format(new Date(report.fetchedAt))} (İstanbul). Yenileme dışında otomatik sorgu yapılmaz.</p>}
    </section>
    <div className="pilot-notice"><strong>Fiyatın kapsamını kontrol edin</strong><p>Tutarlar sağlayıcıdan geldiği biçimde gösterilir. Vergiler, oda tipi, pansiyon, iptal koşulu ve gecelik / toplam baz doğrulanmadan fiyatları eşdeğer kabul etmeyin. Eksik fiyat, otelin dolu olduğu anlamına gelmez.</p></div>
    {current?.result && currentHotel && <section className="panel" aria-label={`${currentHotel.name} kanal ayrıntıları`}><div className="panel-heading"><h2>{currentHotel.name}</h2><button className="button secondary" onClick={() => setDetail(null)}>Ayrıntıyı kapat</button></div><PilotQuotes key={current.result.fetchedAt} result={current.result} /></section>}
    <p className="weather-note">Fiyatlar yalnızca bu oturumda gösterilir.</p>
  </div>;
}
