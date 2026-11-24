# Antalya rakip fiyat pilotu

## Rota

`/competitors`: fiyat karşılaştırması. `/competitors/setup`: manuel eşleştirme. Anahtar kurulumu ve veri kullanımına ilişkin bilgiler [entegrasyon dokümanındadır](../../integrations/makcorps-pilot.md).

## Amaç

Otel yöneticisi, açılışta alınan beş Antalya otelinin fiyatlarını seçtiği otellere göre filtreler; farklı kanalları aynı konaklama koşullarında karşılaştırır (OTA-270).

## Aktör

Yerel geliştirme ortamında pilotu yürüten yönetici. Tenant veya gerçek otel hesabı bağlanmaz; üretimde canlı sorgu kapalıdır.

## Düzen

Ana görünüm: ortak konaklama formu, çoklu otel filtresi ve tek hızlı karşılaştırma tablosu. Eşleştirme kartları ayrı setup sayfasındadır. Örnek oda tipi scope'u gösterilmez; dashboard örnek verileri ayrı kalır.

| Bölge | Bileşen | Veri | Durumlar |
| --- | --- | --- | --- |
| Konaklama ve filtre | `CompetitorPrices` | Ortak tarihler, yetişkin, para birimi; seçili oteller | Açılış yüklemesi / hazır / hata / yenileme / boş seçim |
| Hızlı tablo | `CompetitorPriceTable` | Otel × Booking.com, Expedia, Agoda; tüm kanallar için ayrıntı | Alınıyor / fiyatlı / eksik / eşleşme gerekli / provider hatası |
| Eşleştirme kurulumu | `MakcorpsPilot` | Beş adresli hedef, manuel arama ve onay | Eksik anahtar / hazır / production kapalı / hata |
| Otel ve eşleşme | `PilotHotelCard` | Resmî kaynak adresi, provider aday adı/adresi/ID | Aranmamış / aranıyor / boş / adaylar / adres onaylı / hata |
| Kanal fiyatları | `PilotQuotes` | Ham price/tax/total; sorguya ait stay ve alınma zamanı | Boş / fiyatlı / eksik alanlar |
| Manuel kontrol | `PilotQuotes` details | Aynı koşul teyidi, tutarlılık sonucu, not | Bekliyor / tutarlı / farklı / karşılaştırılamaz |

## Etkileşim

- Ana fiyat sayfası açılışında tüm beş oteli tek POST ile bir defa sorgular. `useRef` aynı Promise'i Strict Mode effect tekrarında paylaşır; ikinci ücretli tur başlamaz. Başlangıç İstanbul gününden 7 gün sonra giriş, 1 gece, 2 yetişkin, 1 oda, TRY.
- Filtre mevcut sonuçları yerelde daraltır; birden fazla otel seçilebilir, tümünü seç/temizle ve boş seçim durumu vardır. Filtreleme, tarih formunu düzenleme ve ayrıntı açma yeni istek göndermez. Değişen koşullar yalnız açık 'Tüm fiyatları yenile' gönderiminde alınır.
- Rapor kendi sorgu tarih/kişi/para birimini taşır. Formdaki taslak değişikliği eski tablonun başlığını değiştirmez. Yenileme eski sonuçları kaldırır; sorgu sürerken form kapalıdır.
- Tekil, güvenilir ad/adres eşleşmesinde otomatik fiyat alınır; daha önce doğrulanmış ID 30 dakika tekrar kullanılır. Belirsiz/eksik eşleşmede otomatik ilk aday seçilmez; kullanıcı setup sayfasına yönlenir.
- Setup sayfası açılışı yalnız ücretsiz konfigürasyon isteği yapar. Burada otel arama/seçme/adres teyidi açık eylemlerdir; fiyat getirme önceki davranışı korur.
- Fiyatlar her zaman kendi sorgu tarih/kişi/para birimiyle gösterilir; üstteki koşulların değiştirilmesi önceki fiyatın koşulunu değiştirmez. Sorgu sürerken koşullar ve tüm ücretli düğmeler kapalıdır.
- Yeniden arama eski seçimi/fiyatı kaldırır; yeni aday veya adres onayı değişimi önceki fiyatı kaldırır.
- Koşul teyidi olmadan 'tutarlı' veya 'farklı' sonucu seçilemez. Otomatik fiyat eşitliği, piyasa ortalaması veya fiyat uygulaması yoktur.
- Kanal tablosu dar ekranda kendi içinde kaydırılır. Kontroller etiketli; hatalar alert olarak duyurulur.
- Fiyat, filtre ve kontrol notları sayfa RAM'indedir; gezinme/yenileme sıfırlar. Yalnız doğrulanmış ID sunucu RAM'inde mapping TTL'siyle korunur. Kalıcı fiyat arşivi için izin beklenir.

## Kaynak

- `src/app/(workspace)/competitors/page.tsx`, `setup/page.tsx`
- `src/components/competitors/competitor-prices.tsx`, `competitor-price-table.tsx`
- `src/components/competitors/makcorps-pilot.tsx`, `pilot-hotel-card.tsx`, `pilot-quotes.tsx`
- `src/data/pilot-hotels.ts`; `src/app/globals.css`

## Bağlı backend

[Makcorps pilot akışı](../backend/makcorps-pilot.md).
