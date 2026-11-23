# OTA-271 — Hava durumu verisi

Değerlendirme tarihi: 24 Kasım 2026. Uygulanan sağlayıcı: **Open-Meteo**.

## Kapsam ve kullanım

`/weather` açıldığında Antalya merkez için tek bir hava durumu isteği başlar. Bölge seçimi Lara, Belek, Kemer, Side, Alanya ve Kaş merkez koordinatlarına geçiş sağlar. Koordinatlar yaklaşık bölge merkezidir; otel/parsel seviyesinde hassasiyet iddiası yoktur. Şehir kapsamı bu görevde Antalya ile sınırlıdır.

Panel; model tabanlı mevcut sıcaklık, hissedilen sıcaklık, nem, rüzgâr ve bugünden başlayan 7 günlük en düşük/en yüksek sıcaklık, yağış olasılığı ve yağış miktarını gösterir. Zamanlar `Europe/Istanbul`, sıcaklık °C, rüzgâr km/sa ve yağış mm birimindedir. Kaynak ve model zamanı görünür. Model verisi istasyon ölçümü veya otelin bulunduğu noktada kesin gözlem değildir.

Fiyatlandırma dashboard'u örnek senaryo kullanmaya devam eder. Hava tahmini bugünden başlar ve ayrı tarihleri açıkça gösterir; fiyat ufku/oda tipi değişiklikleri yeni hava isteği başlatmaz. Hava verisi otomatik fiyat değişikliği yapmaz.

## İstek ve hata davranışı

- Tarayıcı → `GET /api/weather?region=antalya` → sunucu sağlayıcı adaptörü → Open-Meteo.
- Şehir/bölge listesi ve koordinatlar kodda sabittir. Kullanıcı URL, host veya koordinat gönderemez; bilinmeyen/tekrarlanan `region` 400 döner. Parametre yoksa Antalya merkez kullanılır.
- Bu, herkese açık hava verisi için public read-only endpoint'tir; tenant, misafir, rezervasyon veya özel otel verisi okumaz.
- İlk mount'ta tek istek; React geliştirme Strict Mode effect tekrarında aynı Promise kullanılır. Bölge değişimi ve açık **Tekrar dene** eylemi yeni istek başlatır. Polling/focus/oda tipi/fiyat dönemi yenilemesi yoktur. Eski bölge yanıtları yeni seçimin üzerine yazılamaz.
- Başarılı public yanıt tarayıcıda 5 dakika, destekleyen ortak cache'te 15 dakika saklanabilir. Provider isteği `no-store`; tahminler kalıcı kaydedilmez. Geçmiş ERA5 verisi ayrı SQLite arşivinde saklanır. Cache süresi içinde bir landing cache'ten karşılanabilir.
- Sağlayıcı isteği 8 saniye, tarayıcı isteği 15 saniye ile sınırlıdır. Upstream hata, kota, bozuk JSON veya geçersiz veri, güvenli 502 ve tekrar deneme UI'ına dönüşür. Yanlış bölgenin/eski isteğin verisi gösterilmez.
- Null ölçüm `—` olarak gösterilir; sıfır yağış eksik veri sayılmaz. Yanıt şeması, dizi uzunlukları, tarih sırası, zaman dilimi, sayısal değerler ve temel aralıklar doğrulanır.

## Sağlayıcı karşılaştırması

Aşağıdaki entegrasyon/kullanım kolaylığı değerlendirmeleri bu görevin ihtiyaçlarına göre mühendislik değerlendirmesidir. Kota, lisans ve plan kapsamı satın alma öncesi resmi sayfalardan tekrar kontrol edilmelidir.

| Sağlayıcı | Entegrasyon ve kullanım kolaylığı | Yetenekler / mevcut veriler | Geçmiş veri | Bu proje için değerlendirme |
| --- | --- | --- | --- | --- |
| **Open-Meteo** | Koordinat tabanlı REST/JSON; prototip için anahtar/SDK gerekmez. Birimler, zaman dilimi ve alanlar query ile seçilir. | Mevcut model koşulları, saatlik/günlük tahmin; 16 güne kadar. Sıcaklık, yağış olasılığı/miktarı, rüzgâr, nem; ayrı marine ve air-quality API'ları. | Historical Weather API'de 1940'a kadar reanalysis; Historical Forecast arşivi modeline göre ayrı kapsama sahiptir. Reanalysis ile geçmişte yayınlanan tahmin aynı şey değildir. | En düşük kurulum maliyetiyle bu göreve uygun; uygulandı. Ücretsiz erişim değerlendirme/non-commercial içindir. Ticari kullanım abonelik gerektirir; ticari historical API erişimi Professional veya üzerindedir. |
| **WeatherAPI.com** | API anahtarı + REST/JSON/XML. Şehir adı veya koordinat ve arama/autocomplete ile konum seçimi kolay. Explorer mevcut. | Anlık hava, plana göre 3–14 günlük tahmin; sıcaklık, hissedilen, nem, yağış, rüzgâr, uyarılar; ek marine/air-quality verileri plan kapsamına bağlı. | History endpoint; 2010'a uzanan arşiv, erişilebilir geçmiş aralığı ve detaylar plana bağlı. | Yer adı araması ve geniş ürün alanı için alternatif. Anahtar ve plan seçimi gerekir; bu görevde canlı entegre edilmedi. |
| **Visual Crossing** | Timeline API aynı JSON/CSV sözleşmesiyle tarih aralıklarını, koordinat/adres sorgusunu destekler. Query Builder entegrasyonu denemeyi kolaylaştırır. | Mevcut koşullar, günlük/saatlik tahmin, sıcaklık, yağış, nem, rüzgâr; veri alanları seçilebilir. | Aynı timeline ile geçmiş sorguları; kapsam konum/değişken/kaynağa bağlı. Geçmişte yayınlanmış forecast için ayrıca historical-forecast ürünü/lisansı bulunur. | Geçmiş+gelecek verisini tek endpoint'ten almak için güçlü alternatif. Resmi dokümanda anahtarsız fair-use erişimi de sunuluyor; üretim kotası/lisansı ayrıca değerlendirilmelidir. Canlı entegre edilmedi. |

### İncelenecek resmi kaynaklar

- Open-Meteo: [Forecast API / alanlar ve WMO kodları](https://open-meteo.com/en/docs), [Historical Weather](https://open-meteo.com/en/docs/historical-weather-api), [Historical Forecast](https://open-meteo.com/en/docs/historical-forecast-api), [ticari lisans ve plan kapsamı](https://open-meteo.com/en/pricing).
- WeatherAPI.com: [ürün/API dokümanı](https://www.weatherapi.com/docs/), [Historical API ve plan kapsamı](https://www.weatherapi.com/docs/history-api/), [API Explorer](https://www.weatherapi.com/api-explorer.aspx).
- Visual Crossing: [Timeline API](https://www.visualcrossing.com/resources/documentation/weather-api/timeline-weather-api/), [geçmiş veri kapsamı](https://www.visualcrossing.com/resources/documentation/weather-data/frequently-asked-questions-faq-for-visual-crossing-weather-data/), [historical forecast](https://www.visualcrossing.com/resources/documentation/weather-api/historical-forecast-api/).

## Yapılandırma

Prototip için env gerekmez. Ticari Open-Meteo aboneliği varsa `.env.local` içinde `OPEN_METEO_API_KEY` tanımlanabilir. Sunucu `customer-api.open-meteo.com` adresini seçer; anahtar tarayıcıya/yanıta gönderilmez. Serbest bir provider URL/env host desteği yoktur. Public demo endpoint'inin ücretli kota ile üretime açılması öncesinde uygulamanın kimlik doğrulama ve kota sınırlarına bağlanması gerekir.

Geçmiş ERA5 verisi `/weather/history` ekranından alınır ve yerel SQLite arşivine kaydedilir. [Arşiv akışı ve kalıcılık](../context/backend/weather-history.md). Tahmin paneli ve geçmiş arşivi ayrı veri sözleşmeleri kullanır. Sağlayıcı değişimi gerektiğinde `src/services/weather` adaptörü değiştirilir; UI normalize edilmiş `WeatherReport` sözleşmesini kullanır.

## Doğrulama

`pnpm test` Node'un yerleşik test runner'ını ve TypeScript type stripping desteğini kullanır (Node 22.18+); ek test bağımlılığı yoktur. Testler provider normalizasyonunu, null/sıfır ayrımını, hatalı alan/tarih/dizi/zaman dilimini, seçilen koordinatları/birimleri, anahtarlı endpoint'i, kota/zaman aşımı/JSON hatalarını kapsar. `pnpm lint`, `pnpm exec tsc --noEmit` ve `pnpm build` diğer kontrollerdir.
