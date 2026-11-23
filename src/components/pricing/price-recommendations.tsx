"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { usePricing, dayFormat, money, decimal } from "./pricing-provider";

export default function PriceRecommendations() {
  const { room, dates, pending, range, setApplied } = usePricing();
  const [filter, setFilter] = useState("Tümü");
  const recommendations = dates.filter((day) => day.suggested !== day.current)
    .filter((day) => filter === "Tümü" || (filter === "Artış" ? day.suggested > day.current : day.suggested < day.current));
  return <section className="panel recommendations-panel" id="recommendations" aria-labelledby="recommendations-title"><div className="panel-heading"><div><h2 id="recommendations-title">Fiyat önerileri</h2><p>Değişiklikleri değerlendirin, oda gelirinizi planlayın.</p></div><span className="count-badge" aria-live="polite">{pending.length} bekleyen</span></div><div className="filter-tabs" role="group" aria-label="Fiyat değişimi filtresi">{["Tümü", "Artış", "İndirim"].map((value) => <button key={value} aria-pressed={filter === value} onClick={() => setFilter(value)}>{value}</button>)}</div><div className="rate-table-scroll"><table className="rate-table"><caption className="sr-only">{range} dönemi {room.name} fiyat önerileri</caption><thead><tr><th scope="col">Konaklama</th><th scope="col">Başlangıç</th><th scope="col">Önerilen</th><th scope="col">Değişim</th><th scope="col">İşlem</th></tr></thead><tbody>{recommendations.map((day) => <tr key={day.id}><th scope="row">{dayFormat.format(day.date)}<small>{day.reason}</small></th><td>{money.format(day.current)}</td><td className="suggested-price">{money.format(day.suggested)}</td><td><span className={`badge ${day.suggested > day.current ? "success" : "warning"}`}>{day.suggested > day.current ? "+" : ""}{decimal.format((day.suggested / day.current - 1) * 100)}%</span></td><td><button className="apply-button" disabled={day.applied} aria-label={`${dayFormat.format(day.date)} fiyatını örnekte uygula`} onClick={() => setApplied((previous) => [...previous, day.id])}>{day.applied ? <><Icon name="check" size={13} />Uygulandı</> : "Örnekte uygula"}</button></td></tr>)}</tbody></table></div><p className="panel-footnote" role="status">{dates.filter((day) => day.applied).length > 0 ? `${dates.filter((day) => day.applied).length} fiyat bu örnekte uygulandı. Gelir göstergeleri güncellendi.` : "Uygulama yalnızca bu önizlemede geçerlidir. Satış kanallarına fiyat gönderilmez."}</p></section>;
}
