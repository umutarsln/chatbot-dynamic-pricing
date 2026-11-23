# Gelir yönetimi çalışma alanı

Sayfalar, `src/app/(workspace)/layout.tsx` altındaki ortak layout'u kullanır. `/` adresi `/dashboard` adresine yönlenir. Menü hash/anchor yerine Next Link ile gerçek sayfalara gider. Aktif sayfa pathname'den belirlenir; breadcrumb, başlık ve açıklama aynı sayfayı izler.

| URL | İçerik sahibi |
| --- | --- |
| `/dashboard` | `src/components/dashboard/dashboard-overview.tsx`: gelir metrikleri, fiyat grafiği ve fırsat özeti |
| `/pricing-calendar` | `src/components/pricing/pricing-calendar.tsx`: seçili 7/14/30 günlük fiyat/doluluk takvimi |
| `/price-recommendations` | `src/components/pricing/price-recommendations.tsx`: artış/indirim filtreleri, öneriler ve örnekte uygulama |
| `/competitors` | `src/components/pricing/competitor-analysis.tsx`: seçili oda tipinin rakip karşılaştırması |
| `/pricing-rules` | `src/components/pricing/pricing-rules.tsx`: seçili oda tipinin taban/tavan fiyatı ve örnek yayınlama çerçevesi |
| `/weather/history` | `src/components/weather/weather-history.tsx`: kalıcı geçmiş arşivi, tarih/bölge seçimi ve veri aktarımı |
| `/weather` | `src/components/weather/weather-panel.tsx`: canlı hava verisi ve bölge seçimi |

`src/components/workspace/workspace-shell.tsx` menü, breadcrumb, sayfa başlığı, scope kontrolleri ve rapor indirmeyi içerir. İkonlar `src/components/ui/icon.tsx` içinde ortaktır. Örnek oda ve fiyat desenleri `src/data/pricing-demo.ts` altındadır.

`src/components/pricing/pricing-provider.tsx` oda tipi, fiyat ufku ve örnekte uygulanan fiyatları ortak layout kapsamında tutar. Client navigation sırasında seçimler ve uygulanan fiyatlar korunur; tam yenilemede örnek başlangıç değerlerine döner. Öneri durum filtresi yalnızca öneriler sayfasına aittir ve tekrar girişte Tümü olur. Fiyat hesapları önceki örnek senaryoyla aynıdır.

Hava durumu ve geçmiş arşiv sayfalarında fiyat scope kontrolleri/raporu gösterilmez. Rakip ve kural sayfalarında yalnızca oda tipi seçilir. Hava paneli yalnızca kendi sayfasında mount olur; diğer sayfalar hava API isteği başlatmaz. Ayrıntı: [Hava durumu](weather.md).
