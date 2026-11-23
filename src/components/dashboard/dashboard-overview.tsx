"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { usePricing, money, decimal, dayFormat } from "@/components/pricing/pricing-provider";

export default function DashboardOverview() {
  const { room, dates, occupancy, soldNights, availableNights, adr, revenue, range, pending } = usePricing();
  const chartMin = room.min - 200;
  const chartMax = room.max;
  const chartY = (price: number) => 172 - (price - chartMin) / (chartMax - chartMin) * 145;
  const chartX = (index: number) => 20 + index / (dates.length - 1) * 600;
  const suggestedPoints = dates.map((day, index) => `${chartX(index)},${chartY(day.suggested)}`).join(" ");
  const currentPoints = dates.map((day, index) => `${chartX(index)},${chartY(day.applied ? day.suggested : day.current)}`).join(" ");

  return <>
    <section className="metrics" aria-label="Gelir göstergeleri" aria-live="polite">
          {([
            { label: "Tahmini doluluk", value: `%${decimal.format(occupancy)}`, note: `${soldNights} / ${availableNights} oda-gece`, icon: "hotel" },
            { label: "Ortalama günlük fiyat", value: money.format(adr), note: "ADR · satılan oda başına", icon: "calendar" },
            { label: "Müsait oda başına gelir", value: money.format(revenue / availableNights), note: "RevPAR · tüm oda kapasitesi", icon: "revenue" },
            { label: "Tahmini oda geliri", value: money.format(revenue), note: `${dates.length} günlük örnek tahmin`, icon: "competitors" },
          ] as const).map((metric) => <article className="metric" key={metric.label}><div className="metric-label">{metric.label}<Icon name={metric.icon} size={17} /></div><strong className="metric-value">{metric.value}</strong><div className="metric-foot"><small>{metric.note}</small></div></article>)}
        </section>
    <div className="analytics-grid">
      <section className="panel" aria-labelledby="trend-title"><div className="panel-heading"><div><h2 id="trend-title">Fiyat ve talep görünümü</h2><p>{range} · {room.name}</p></div><span className="count-badge">TRY / gece</span></div>
            <div className="price-legend"><span><i />Önerilen fiyat</span><span><i className="current-key" />Mevcut fiyat</span></div>
            <svg className="price-chart" viewBox="0 0 650 215" role="img" aria-label={`${range} için ${room.name} mevcut ve önerilen gecelik fiyatları. Ayrıntılar fiyat takvimi sayfasındadır.`}>
              {[0, 1, 2, 3].map((step) => { const y = 27 + step * 48; return <g key={step}><line x1="20" y1={y} x2="620" y2={y} stroke="var(--border)" strokeDasharray="3 4" /><text x="620" y={y - 7} textAnchor="end">{Math.round(chartMax - step / 3 * (chartMax - chartMin)).toLocaleString("tr-TR")} ₺</text></g>; })}
              <polyline points={currentPoints} fill="none" stroke="var(--muted)" strokeWidth="2" strokeDasharray="5 5" />
              <polyline points={suggestedPoints} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinejoin="round" />
              {dates.map((day, index) => <g key={day.id}>{(index % Math.ceil(dates.length / 7) === 0 || index === dates.length - 1) && <><circle cx={chartX(index)} cy={chartY(day.suggested)} r="4" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" /><text x={chartX(index)} y="205" textAnchor="middle">{dayFormat.format(day.date)}</text></>}</g>)}
            </svg>
            <div className="panel-footnote"><Icon name="sparkle" size={15} />Öneriler talep ve doluluğa göre değişir; fiyat sınırları korunur.</div>
          </section>
      <section className="panel overview-opportunities" aria-labelledby="opportunities-title">
        <div><h2 id="opportunities-title">Fiyat fırsatları</h2><p className="panel-subtitle">{range} · {room.name}</p></div>
        <strong className="opportunity-count">{pending.length}</strong>
        <p>İncelemenizi bekleyen fiyat önerisi</p>
        <dl className="pricing-rules">
          <div><dt>Artış önerisi</dt><dd>{pending.filter((day) => day.suggested > day.current).length} gün</dd></div>
          <div><dt>İndirim önerisi</dt><dd>{pending.filter((day) => day.suggested < day.current).length} gün</dd></div>
        </dl>
        <Link className="button primary" href="/price-recommendations">Önerileri incele</Link>
        <Link className="overview-link" href="/weather">Bölgenizin hava tahminine bakın →</Link>
      </section>
    </div>
  </>;
}
