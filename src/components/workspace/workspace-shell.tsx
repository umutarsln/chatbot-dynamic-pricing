"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { usePricing } from "@/components/pricing/pricing-provider";
import { rooms, type RoomType } from "@/data/pricing-demo";

const navigation = [
  { icon: "overview", label: "Genel bakış", href: "/dashboard", title: "Gelire genel bakış", description: "Talebi takip edin, fiyat fırsatlarını değerlendirin." },
  { icon: "calendar", label: "Fiyat takvimi", href: "/pricing-calendar", title: "Fiyat takvimi", description: "Konaklama tarihine göre önerilen fiyatları ve doluluğu inceleyin." },
  { icon: "sparkle", label: "Fiyat önerileri", href: "/price-recommendations", title: "Fiyat önerileri", description: "Fiyat değişikliklerini değerlendirin ve örnekte uygulayın." },
  { icon: "competitors", label: "Rakip analizi", href: "/competitors", title: "Rakip analizi", description: "Antalya’daki otellerde fiyat kapsamını ve veri doğruluğunu kontrol edin." },
  { icon: "rules", label: "Fiyat kuralları", href: "/pricing-rules", title: "Fiyat kuralları", description: "Oda kategorinizin fiyat sınırlarını ve yayınlama yaklaşımını inceleyin." },
  { icon: "weather", label: "Hava durumu", href: "/weather", title: "Antalya hava durumu", description: "Bölgenizin güncel koşullarını ve 7 günlük tahminini takip edin." },
] as const;

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const page = navigation.find((item) => item.href === pathname || pathname.startsWith(`${item.href}/`)) ?? navigation[0];
  const isWeather = pathname === "/weather" || pathname.startsWith("/weather/");
  const isPilot = pathname === "/competitors" || pathname.startsWith("/competitors/");
  const subpageTitles: Record<string, string> = { "/weather/history": "Geçmiş hava durumu", "/competitors/setup": "Otel eşleştirmeleri" };
  const [collapsed, setCollapsed] = useState(false);
  const pricing = usePricing();
  const showPricing = !isWeather && !isPilot;
  const showPeriod = ["/dashboard", "/pricing-calendar", "/price-recommendations"].includes(pathname);

  function downloadReport() {
    const rows = pricing.dates.map((day) => [day.date.toISOString().slice(0, 10), pricing.room.name, day.applied ? day.suggested : day.current, day.suggested, day.occupancy, day.applied ? "Örnekte uygulandı" : "Öneri"]);
    const csv = "\uFEFFTarih;Oda tipi;Mevcut fiyat (TRY);Önerilen fiyat (TRY);Tahmini doluluk (%);Durum\n" + rows.map((row) => row.join(";")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `otai-ornek-fiyat-raporu-${pricing.roomType}-${pricing.horizon}-gun.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={`workspace ${collapsed ? "is-collapsed" : ""}`}>
      <a className="skip-link" href="#main">İçeriğe geç</a>
      <header className="workspace-header">
        <Link className="brand" href="/dashboard" aria-label="Otai ana sayfa"><span className="brand-mark">o</span><span className="brand-name">otai</span></Link>
        <div className="topbar"><div className="breadcrumb"><span>Dinamik fiyatlandırma</span><span className="breadcrumb-slash">/</span><strong>{page.label}</strong></div><div className="topbar-end"><span className="demo-badge">Örnek çalışma alanı</span><span className="avatar profile-avatar" title="Ayşe Demir">AD</span></div></div>
      </header>
      <aside className="sidebar">
        <div>
          <div className="hotel-switch"><span className="hotel-icon"><Icon name="hotel" size={21} /></span><div><strong>Otai Sahil Oteli</strong><span>Antalya, Türkiye</span></div></div>
          <p className="nav-label">Gelir yönetimi</p>
          <nav aria-label="Fiyatlandırma sayfaları">{navigation.map((item) => <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} aria-label={collapsed ? item.label : undefined} aria-current={(pathname === item.href || pathname.startsWith(`${item.href}/`)) ? "page" : undefined}><Icon name={item.icon} /><span>{item.label}</span></Link>)}</nav>
        </div>
        <div className="sidebar-bottom"><div className="assistant-status"><Icon name="sparkle" size={16} /><div><strong>Kontrol sizde.</strong><p>Önerileri inceleyip karar verin.</p></div></div><div className="sidebar-footer"><span>Otai Revenue</span><button className="icon-button collapse-button" aria-label={collapsed ? "Menüyü genişlet" : "Menüyü daralt"} aria-expanded={!collapsed} onClick={() => setCollapsed(!collapsed)}><Icon name="panel" /></button></div></div>
      </aside>
      <main id="main" className="main">
        <section className="page-heading"><div><div className="heading-context"><span className="status-dot" />Doğru oda. Doğru zaman. Doğru fiyat.</div><h1>{subpageTitles[pathname] ?? page.title}</h1><p>{pathname === "/weather/history" ? "Bölgenizin geçmiş hava verilerini alın, saklayın ve karşılaştırın." : page.description}</p></div>{showPeriod && <button className="button secondary" onClick={downloadReport}><Icon name="download" size={16} />Raporu indir</button>}</section>
        {showPricing && <div className="scope-bar"><div className="scope-hotel"><Icon name="hotel" size={17} /><strong>Otai Sahil Oteli</strong><span className="scope-divider" /><span>TRY · gecelik</span></div><div className="scope-controls"><label className="period-select"><select aria-label="Oda tipi" value={pricing.roomType} onChange={(event) => pricing.setRoomType(event.target.value as RoomType)}>{Object.entries(rooms).map(([value, item]) => <option key={value} value={value}>{item.name}</option>)}</select><Icon name="down" size={14} /></label>{showPeriod && <label className="period-select"><Icon name="calendar" size={16} /><select aria-label="Tahmin dönemi" value={pricing.horizon} onChange={(event) => pricing.setHorizon(event.target.value)}>{[7, 14, 30].map((days) => <option key={days} value={days}>Önümüzdeki {days} gün</option>)}</select><Icon name="down" size={14} /></label>}</div></div>}
        <div className="workspace-page" key={pathname}>{children}</div>
        <footer className="main-footer"><span><span className="mini-brand">otai</span>Dinamik fiyatlandırma ve gelir yönetimi.</span><span>{isWeather ? "Hava verisi Open-Meteo’dan alınır." : isPilot ? "Makcorps · oturumluk yerel pilot" : "Fiyat ve doluluk verileri örnektir."}</span></footer>
      </main>
    </div>
  );
}
