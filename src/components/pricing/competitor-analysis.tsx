"use client";

import { Icon } from "@/components/ui/icon";
import { usePricing, money, decimal } from "./pricing-provider";

export default function CompetitorAnalysis() {
  const { room, competitors, marketAverage } = usePricing();
  return <section className="panel" id="competitors" aria-labelledby="competitors-title"><div className="panel-heading"><div><h2 id="competitors-title">Rakip fiyatları</h2><p>24 Kasım · benzer oda kategorileri</p></div><Icon name="competitors" /></div><div className="market-average"><strong>{money.format(marketAverage)}</strong><span>rakip ortalaması / gece</span></div><div className="competitor-list">{competitors.map((hotel) => <div className="competitor-row" key={hotel.name}><div><strong>{hotel.name}</strong><small>Tahmini doluluk %{hotel.occupancy}</small></div><b>{money.format(hotel.price)}</b></div>)}</div><div className="market-position"><span className="status-dot" />Fiyatınız piyasanın %{decimal.format((1 - room.base / marketAverage) * 100)} altında.</div><p className="source-note">Kurmaca rakipler ve örnek fiyatlar.</p></section>;
}
