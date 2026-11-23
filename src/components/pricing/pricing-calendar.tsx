"use client";

import { usePricing, dayFormat, weekdayFormat, money } from "./pricing-provider";

export default function PricingCalendar() {
  const { room, dates } = usePricing();
  return <section className="panel calendar-panel" id="calendar" aria-labelledby="calendar-title"><div className="panel-heading"><div><h2 id="calendar-title">Fiyat takvimi</h2><p>{dates.length} gün · {room.name} · önerilen gecelik fiyat</p></div><span className="count-badge">{room.capacity} oda</span></div><div className="rate-calendar">{dates.map((day) => <article key={day.id} className={`rate-day ${day.occupancy >= 90 ? "high-demand" : ""}`}><div><strong>{dayFormat.format(day.date)}</strong><span>{weekdayFormat.format(day.date)}</span></div><b>{money.format(day.suggested)}</b><div className="occupancy-track"><span style={{ width: `${day.occupancy}%` }} /></div><p>%{day.occupancy} doluluk</p><small>{day.applied ? "Örnekte uygulandı" : day.reason}</small></article>)}</div></section>;
}
