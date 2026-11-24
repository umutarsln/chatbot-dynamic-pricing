"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { pilotHotels } from "@/data/pilot-hotels";
import type { Stay } from "@/services/competitors/makcorps-contract";
import { PilotHotelCard } from "./pilot-hotel-card";

export default function MakcorpsPilot() {
  const [access, setAccess] = useState<{ configured: boolean; local: boolean } | null>(null);
  const [statusError, setStatusError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [stay, setStay] = useState<Stay | null>(null);
  const [coverage, setCoverage] = useState<Record<string, { mapped: boolean; priced: boolean }>>({});
  useEffect(() => {
    let active = true;
    fetch("/api/competitors/pilot", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error();
      const data = await response.json();
      if (active) {
        setAccess(data);
        const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
        const start = new Date(`${today}T00:00:00Z`);
        start.setUTCDate(start.getUTCDate() + 7);
        const end = new Date(start);
        end.setUTCDate(end.getUTCDate() + 1);
        setStay({ checkin: start.toISOString().slice(0, 10), checkout: end.toISOString().slice(0, 10), adults: 2, rooms: 1, currency: "TRY" });
      }
    }).catch(() => { if (active) setStatusError(true); });
    return () => { active = false; };
  }, []);
  const ready = !!access?.configured && access.local;
  return <div className="pilot-page"><Link className="overview-link" href="/competitors">← Fiyat karşılaştırmasına dön</Link>
    <div className="pilot-intro"><div><span className="eyebrow">MAKCORPS · ANTALYA PİLOTU</span><h2>Önce doğru otel, sonra doğru fiyat.</h2><p>5 otelde kapsamı ve fiyatların karşılaştırılabilirliğini kontrol edin.</p></div></div>
    <div className="pilot-summary" aria-label="Pilot kapsamı"><div><strong>5</strong><span>hedef otel</span></div><div><strong>{Object.values(coverage).filter((item) => item.mapped).length}<small> / 5</small></strong><span>adres onaylandı</span></div><div><strong>{Object.values(coverage).filter((item) => item.priced).length}<small> / 5</small></strong><span>fiyat dönen otel</span></div></div>
    <section className="panel pilot-conditions" aria-labelledby="pilot-stay"><div className="panel-heading"><div><h2 id="pilot-stay">Konaklama koşulları</h2><p>Tüm oteller için aynı tarihler · 1 oda · çocuk yok</p></div><span className="count-badge">{ready ? "Anahtar tanımlı" : access?.local === false ? "Yerel pilot" : "API erişimi bekleniyor"}</span></div>
      {stay && <div className="history-form pilot-form"><label>Giriş<input type="date" value={stay.checkin} disabled={busy} onChange={(event) => setStay({ ...stay, checkin: event.target.value })} /></label><label>Çıkış<input type="date" value={stay.checkout} disabled={busy} onChange={(event) => setStay({ ...stay, checkout: event.target.value })} /></label><label>Yetişkin<select value={stay.adults} disabled={busy} onChange={(event) => setStay({ ...stay, adults: Number(event.target.value) })}>{[1, 2, 3, 4].map((count) => <option key={count} value={count}>{count} yetişkin</option>)}</select></label><label>Para birimi<select value={stay.currency} disabled={busy} onChange={(event) => setStay({ ...stay, currency: event.target.value as Stay["currency"] })}>{["TRY", "EUR", "USD"].map((code) => <option key={code}>{code}</option>)}</select></label></div>}
      <p className="weather-note">{statusError ? "Bağlantı durumu alınamadı. Sayfayı yenileyin." : !access ? "Bağlantı kontrol ediliyor…" : !access.local ? "Canlı pilot, geliştirme sunucusunda localhost üzerinden çalışır." : !access.configured ? "Makcorps bağlantısı henüz yapılandırılmamış." : "Yalnızca düğmeye bastığınızda istek gönderilir. Her işlem API kredisi tüketebilir; otomatik yenileme yapılmaz."}</p>
    </section>
    <div className="pilot-notice"><strong>Karşılaştırmadan önce kontrol edin</strong><p>Oda tipi, pansiyon, iptal koşulu ve fiyatın gecelik mi toplam mı olduğu bu yanıtta doğrulanmış değildir. Vergi alanları ayrı gösterilir. Eksik fiyat, müsaitlik olmadığı anlamına gelmez.</p></div>
    <div className="pilot-hotels">{pilotHotels.map((hotel, index) => <PilotHotelCard key={hotel.id} hotel={hotel} index={index + 1} stay={stay} enabled={ready} busy={busy} onBusy={setBusy} onCoverage={(value) => setCoverage((previous) => ({ ...previous, [hotel.id]: value }))} />)}</div>
    <p className="weather-note">Oturumluk değerlendirme: fiyatlar, seçimler ve kontrol notları bu sayfadan ayrılınca silinir. Kalıcı arşiv ve ürün içinde kullanım için sağlayıcı teyidi bekleniyor.</p>
  </div>;
}
