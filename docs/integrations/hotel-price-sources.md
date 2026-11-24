# OTA-270: farklı otellerden fiyat alma

Kontrol tarihi: 24 Kasım 2026. Entegrasyon/kullanım zorluğu resmî erişim adımlarından çıkarılan teknik değerlendirmedir; ölçülmüş entegrasyon süresi değildir. Yalnız Makcorps entegredir. Canlı Antalya mapping hatası için [pilot raporu](makcorps-pilot.md).

| Sağlayıcı | Entegrasyon / kullanım | Yetenekler ve veri | Geçmiş veri | Sınırlama |
| --- | --- | --- | --- | --- |
| [Makcorps](https://www.makcorps.com/documentation/hotel-api-search-by-hotel-id/) | Anahtar + mapping ID + GET; küçük pilot için görece sade JSON | Çoklu OTA fiyat ve vergi; ayrı oda tipi endpoint'i | [Rate Intelligence](https://www.makcorps.com/hotel-rate-intelligence/) geçmiş fiyat ürünü belirtiyor; API, tarih aralığı ve plan teyit edilmeli | Canlı mapping hataları ve istek/kredi sınırı; saklama/gösterim sözleşmesi bekleniyor |
| [Lighthouse API](https://api.mylighthouse.com/) | Token, API add-on, abonelik/property ve compset kurulumu; daha fazla onboarding | Kanal, oda, pansiyon, iptal ve vergi bilgileri; fiyat değişimi | Historic endpoints 365 gün; deneme aboneliğinde yok | Raporlama amaçlı API; ticari görselleştirme önceden yazılı izin gerektiriyor |
| [RateGain RMS](https://rategain.com/solutions-for-rms-companies/) | Satış/onboarding ve RMS push/pull kurulumu; orta–yüksek entegrasyon | Hotel/compset arama, zamanlanmış alışveriş, bütün fiyatlar veya değişen fiyatlar | En az son 365 günlük rate evolution ürün sayfasında belirtiliyor; sözleşme kapsamı teyit edilmeli | Doğrudan fiyat arşivi ve gösterim izinleri ayrıca sözleşmede tanımlanmalı |
| [Booking.com Demand](https://developers.booking.com/demand/docs/getting-started/overview) | Partner erişimi, Affiliate ID ve token; arama/müsaitlik akışı | Booking.com envanterinde ürün fiyatı ve rezervasyon; çoklu OTA kaynağı değil | Rakip fiyat tarihçesi servisi bu dokümanda sunulmuyor | [Production kontrol listesi](https://developers.booking.com/demand/docs/development-guide/production-readiness) dinamik fiyat ve müsaitliği saklamayın diyor; arşiv sağlayıcısı olarak kabul edilmez |

## Manuel kontrol

Her hedefin resmî otel sitesi `src/data/pilot-hotels.ts` içinde bağlantılı. Alternatif kontroller: [Booking.com](https://www.booking.com/), [Expedia](https://www.expedia.com/), [Agoda](https://www.agoda.com/). Aynı otel, tarih, oda, kişi, pansiyon, iade/iptal, vergi, para birimi ve gecelik/toplam baz seçilmeli. Üyelik, ülke ve cihaz indirimleri fark yaratabilir. Bu linkler rezervasyon yapmaz veya aynı koşulu otomatik doğrulamaz.

## Kabul kriterleri ve uygulama

| Kriter | Uygulama |
| --- | --- |
| Açılışta tüm fiyatlar bir kez | `/competitors` açılışında beş hedef için bir POST; Strict Mode'da Promise paylaşımı; server hedef başına sıralı mapping/güvenilir eşleşme/rate akışı; mevcut geçerli eşleşmede mapping atlanır |
| Seçilen otelleri filtrele | Çoklu checkbox, tümünü seç/temizle; yerel filtre, yeni provider isteği yok |
| Sade arayüz | Bir ortak form ve bir hotel × kanal tablosu; bütün kanallar/vergi ayrıntısı isteğe bağlı açılır |
| Farklı kontrol yerleri + kısa tablo | Bu dokümanda dört sağlayıcı karşılaştırması, resmî dokümanlar ve üç manuel OTA bağlantısı; kullanıcı isteğiyle ayrı sources UI rotası bulunmuyor |
| Entegrasyon/kullanım/yetenek/veri/tarihçe | Yukarıdaki doküman karşılaştırması; desteklenmeyen tarihçe özellikleri canlı API gibi sunulmaz |

Canlı fiyat yalnız ad/adres eşleşmesi kesinleşirse alınır; belirsiz ad, eksik adres, yanlış şehir veya birden fazla eşdeğer aday `needs-mapping` durumudur. Sadece isimle ilk aday seçilmez. Provider hatası otel bazında korunur; başarılı oteller gösterilmeye devam eder. Provider başarısızken veri uydurulmaz.

Toplu tur en çok 10 dış API isteği (5 mapping + 5 rate), geçerli eşleşmelerle en çok 5 rate. Kullanıcı yenilemedikçe polling veya retry yok; filtreleme ücretsizdir. Ücret hesabı için gerçek plan/kredi maliyeti kontrol edilmeli. Ortak yerel sınır 20 çağrı/saat; üretim POST kapalı, dev yalnız loopback dinler.

Kalıcı fiyat saklama bu issue kapsamında etkinleştirilmez; önceki hava durumu SQLite arşivi bundan bağımsızdır. Geçmiş fiyat, belirli bir konaklama için geçmiş gözlem anındaki tekliftir; geçmiş giriş tarihiyle canlı sorgu yapmak fiyat geçmişi sağlamaz. Sağlayıcı tarihçe erişimi ve veri saklama hakkı birlikte doğrulanmalı.

## Doğrulama

- Testlerde Strict Mode açılışında bir toplu POST; çoklu/boş otel seçimi, filtre ve tarih düzenlemede yeni çağrı olmaması; açık yenileme; bütün kanal ayrıntıları; partial failure; güvenli eşleşme/yanlış adres/şehir/çoklu aday ve allowlist negatifleri doğrulandı.
- Yerel canlı açılışında beş hedef sorgulandı. Akra için güvenilir eşleşme çıkmadı, diğer dört hedef HTTP 400 döndü; ayrıca yapılan manuel Akra araması da HTTP 400 döndü. Canlı fiyat alınamadı veya doğrulanamadı. Bu durum, otellerin müsait olmadığı veya provider kapsamı dışında olduğu anlamına gelmez.
- Browser'da tümünü temizle ve iki otel seçimi doğru satır sayısını verdi. Sağlayıcı karşılaştırması bu dokümanda tutuluyor. Canlı fiyat doğruluğu sağlayıcı mapping sorunu çözülene kadar açık kalır.

Son yenilemede provider HTTP 429 istek/kredi sınırı ve Porto Bello için HTTP 410 görüldü; ek otomatik deneme yapılmadı. Eşzamanlı aynı sorgular tek uçuşta paylaşılır; tamamlanan fiyatlar önbelleğe alınmaz. Canlı doğrulama hesap erişimi/kredisi ve mapping sorunu çözülene kadar açık kalır.
