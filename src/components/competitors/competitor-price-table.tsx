import Link from "next/link";
import { pilotHotels } from "@/data/pilot-hotels";
import type { PricesReport } from "@/services/competitors/makcorps-contract";

const channels = [{ name: "Booking.com", pattern: /^booking(?:\.com)?$/i }, { name: "Expedia", pattern: /^expedia(?:\.com)?$/i }, { name: "Agoda", pattern: /^agoda(?:\.com)?$/i }];

export function CompetitorPriceTable({ hotels, report, loading, failed, onDetails }: { hotels: string[]; report: PricesReport | null; loading: boolean; failed: boolean; onDetails: (hotel: string) => void }) {
  if (!hotels.length) return <p className="history-message">Gösterilecek otel seçilmedi. Yukarıdan bir veya daha fazla otel seçin.</p>;
  return <div className="pilot-table-scroll" tabIndex={0} role="region" aria-label="Oteller arası fiyat karşılaştırması" aria-busy={loading}><table className="pilot-table competitor-table"><caption className="source-note">Kanalın fiyat alanı · vergi ve toplam ayrıntıları kanal görünümünde</caption><thead><tr><th scope="col">Otel</th>{channels.map((channel) => <th scope="col" key={channel.name}>{channel.name}</th>)}<th scope="col">Durum / diğer kanallar</th></tr></thead><tbody>{pilotHotels.filter((hotel) => hotels.includes(hotel.id)).map((hotel) => {
    const row = report?.hotels.find((item) => item.hotel === hotel.id);
    return <tr key={hotel.id}><th scope="row"><strong>{hotel.name}</strong><small>{hotel.district}</small><a href={hotel.source} target="_blank" rel="noreferrer">Resmî site ↗</a></th>{channels.map((channel) => {
      const quotes = row?.result?.quotes.filter((quote) => channel.pattern.test(quote.vendor.trim()));
      return <td key={channel.name}>{loading ? "Alınıyor…" : !quotes?.length ? "—" : quotes.map((quote, index) => <span className="comparison-price" key={index}>{quote.price ?? "Fiyat dönmedi"}</span>)}</td>;
    })}<td>{loading ? "Sorgulanıyor…" : failed ? "Alınamadı" : <>{row?.status === "needs-mapping" ? <><span>{row.message}</span><Link className="comparison-details" href="/competitors/setup">Eşleştirmeyi kontrol et →</Link></> : row?.status === "error" ? <span className="history-error">{row.message}</span> : row?.status === "ready" ? "Fiyat alındı" : "Fiyat dönmedi"}{!!row?.result?.quotes.length && <button className="comparison-details" onClick={() => onDetails(hotel.id)}>{row.result.quotes.length} kanal · Ayrıntılar →</button>}</>}</td></tr>;
  })}</tbody></table></div>;
}
