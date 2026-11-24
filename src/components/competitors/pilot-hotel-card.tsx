"use client";

import { useState } from "react";
import type { PilotHotel } from "@/data/pilot-hotels";
import type { HotelCandidate, RateResult, Stay } from "@/services/competitors/makcorps-contract";
import { PilotQuotes } from "./pilot-quotes";

export function PilotHotelCard({ hotel, index, stay, enabled, busy, onBusy, onCoverage }: {
  hotel: PilotHotel; index: number; stay: Stay | null; enabled: boolean; busy: boolean;
  onBusy: (value: boolean) => void; onCoverage: (value: { mapped: boolean; priced: boolean }) => void;
}) {
  const [candidates, setCandidates] = useState<HotelCandidate[] | null>(null);
  const [selected, setSelected] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [result, setResult] = useState<RateResult | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<"mapping" | "rates" | null>(null);
  async function run(action: "mapping" | "rates") {
    if (busy) return;
    setError(""); setPending(action); onBusy(true);
    if (action === "mapping") { setCandidates(null); setSelected(""); setConfirmed(false); setResult(null); onCoverage({ mapped: false, priced: false }); }
    else { setResult(null); onCoverage({ mapped: confirmed, priced: false }); }
    try {
      const response = await fetch("/api/competitors/pilot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, hotel: hotel.id, hotelId: selected, addressConfirmed: confirmed, ...stay }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "İstek tamamlanamadı.");
      if (action === "mapping") setCandidates(data.candidates);
      else { setResult(data); onCoverage({ mapped: confirmed, priced: data.quotes.some((quote: { price: string | null; total: string | null }) => quote.price !== null || quote.total !== null) }); }
    } catch (error) { setError(error instanceof Error ? error.message : "İstek tamamlanamadı."); }
    finally { setPending(null); onBusy(false); }
  }
  return <section className="panel pilot-hotel" aria-labelledby={`hotel-${hotel.id}`}>
    <div className="pilot-hotel-heading"><span className="pilot-index">{String(index).padStart(2, "0")}</span><div><h2 id={`hotel-${hotel.id}`}>{hotel.name}</h2><span className="pilot-district">{hotel.district} · Antalya</span></div><span className="count-badge">{confirmed ? "Adres onaylandı" : "Eşleşme bekliyor"}</span></div>
    <div className="pilot-hotel-address"><p>{hotel.address}</p><a href={hotel.source} target="_blank" rel="noreferrer">Resmî adres kaynağı ↗</a></div>
    <div className="pilot-hotel-actions"><button className="button secondary" disabled={!enabled || busy} onClick={() => run("mapping")}>{pending === "mapping" ? "Otel aranıyor…" : candidates ? "Yeniden eşleşme ara" : "1. Oteli Makcorps’ta ara"}</button><span>Ad ve adresi karşılaştırın; ilk sonuç otomatik seçilmez.</span></div>
    {candidates && <fieldset className="pilot-candidates"><legend>Makcorps sonuçları</legend>{candidates.length === 0 ? <p className="weather-note">Otel kaydı bulunamadı. Kapsam sağlayıcıyla kontrol edilmeli.</p> : candidates.map((candidate) => <label key={candidate.id}><input type="radio" name={`candidate-${hotel.id}`} value={candidate.id} checked={selected === candidate.id} disabled={busy} onChange={() => { setSelected(candidate.id); setConfirmed(false); setResult(null); onCoverage({ mapped: false, priced: false }); }} /><span><strong>{candidate.name}</strong><small>{candidate.address || "Adres dönmedi — doğrulama gerekli"}{candidate.location ? ` · ${candidate.location}` : ""}</small><small>Makcorps ID: {candidate.id}</small></span></label>)}</fieldset>}
    {selected && <div className="pilot-confirm"><label><input type="checkbox" checked={confirmed} disabled={busy} onChange={(event) => { setConfirmed(event.target.checked); setResult(null); onCoverage({ mapped: event.target.checked, priced: false }); }} />Otelin adını ve adresini kaynakla karşılaştırdım; aynı tesis olduğunu doğruladım.</label><button className="button primary" disabled={!enabled || busy || !confirmed || !stay} onClick={() => run("rates")}>{pending === "rates" ? "Fiyatlar alınıyor…" : "2. Fiyatları getir"}</button></div>}
    {error && <p className="history-message history-error" role="alert">{error}</p>}
    {result && <PilotQuotes key={result.fetchedAt} result={result} />}
  </section>;
}
