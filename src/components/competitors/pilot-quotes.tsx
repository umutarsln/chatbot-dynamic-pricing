"use client";

import { useState } from "react";
import type { RateResult } from "@/services/competitors/makcorps-contract";

export function PilotQuotes({ result }: { result: RateResult }) {
  const [checked, setChecked] = useState(false);
  const [verdict, setVerdict] = useState("pending");
  const { stay } = result;
  return <div className="pilot-quotes">
    <div className="panel-heading"><div><h3>Sağlayıcı fiyat yanıtı</h3><p>{stay.checkin} → {stay.checkout} · {stay.adults} yetişkin · {stay.rooms} oda · İstenen para birimi: {stay.currency}</p></div><span className="count-badge">{result.quotes.filter((quote) => quote.price !== null || quote.total !== null).length} fiyatlı kanal</span></div>
    {result.quotes.length ? <div className="pilot-table-scroll" tabIndex={0} role="region" aria-label="Kanal fiyatları"><table className="pilot-table"><thead><tr><th>Kanal</th><th>Fiyat alanı</th><th>Vergi alanı</th><th>Toplam alanı</th></tr></thead><tbody>{result.quotes.map((quote, index) => <tr key={`${quote.vendor}-${index}`}><th scope="row">{quote.vendor}</th><td>{quote.price ?? "Dönmedi"}</td><td>{quote.tax ?? "Dönmedi"}</td><td>{quote.total ?? "Dönmedi"}</td></tr>)}</tbody></table></div> : <p className="history-message">Bu sorguda fiyat dönmedi. Otelin kapalı veya tamamen dolu olduğu sonucuna varılamaz.</p>}
    <p className="weather-note">Alınma zamanı: {new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Istanbul" }).format(new Date(result.fetchedAt))} (İstanbul). Alanlar sağlayıcıdan geldiği biçimde gösterilir; tutarlar toplanmaz veya geceliğe çevrilmez.</p>
    <details className="pilot-audit"><summary>3. Fiyat doğruluğunu kontrol et</summary><p>Aynı kanalın sitesinde aynı otel, tarih, kişi, oda tipi, pansiyon, iptal ve vergi koşullarını karşılaştırın. Para birimini ve gecelik / toplam fiyat bazını da doğrulayın.</p><label className="pilot-check"><input type="checkbox" checked={checked} onChange={(event) => { setChecked(event.target.checked); setVerdict("pending"); }} />Karşılaştırma koşullarının aynı olduğunu doğruladım.</label><label className="pilot-verdict">Kontrol sonucu<select value={verdict} onChange={(event) => setVerdict(event.target.value)}><option value="pending">Henüz kontrol edilmedi</option><option value="match" disabled={!checked}>Kontrol edilen fiyatlar tutarlı</option><option value="different" disabled={!checked}>Fiyat farkı var</option><option value="incomparable">Koşullar karşılaştırılamıyor</option></select></label><label className="pilot-verdict">Kontrol notu<textarea maxLength={1200} placeholder="Kanal, oda, iptal koşulu, vergi, karşılaştırılan tutar ve kontrol zamanı…" /></label><p className="weather-note">Bu değerlendirme oturumluk bir nottur; doğrulanmış fiyat verisi veya kalıcı rapor olarak kaydedilmez.</p></details>
  </div>;
}
