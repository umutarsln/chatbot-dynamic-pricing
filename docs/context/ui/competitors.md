# Antalya rakip fiyat pilotu

## Rota

`/competitors`; kurulum ve haklar: `/competitors/usage`.

## Amaç

Otel yöneticisinin beş Antalya tesisinde Makcorps eşleşmesini, fiyat kapsamını ve karşılaştırılabilirliğini kontrol etmesini sağlar.

## Aktör

Yerel geliştirme ortamında pilotu yürüten yönetici. Tenant veya gerçek otel hesabı bağlanmaz; üretimde canlı sorgu kapalıdır.

## Düzen

Ortak çalışma alanı, pilot özeti ve konaklama koşulları; ardından beş sıralı otel bölümü. Eski örnek rakip fiyatları bu sayfadan kaldırıldı. Örnek oda tipi scope'u gösterilmez; dashboard örnek verileri ayrı kalır.

| Bölge | Bileşen | Veri | Durumlar |
| --- | --- | --- | --- |
| Pilot koşulları ve özet | `MakcorpsPilot` | Ortak tarihler, yetişkin, para birimi; 5 hedef, onay/fiyatlı otel sayıları | Bağlantı bekleniyor / eksik anahtar / hazır / production kapalı / hata |
| Otel ve eşleşme | `PilotHotelCard` | Resmî kaynak adresi, provider aday adı/adresi/ID | Aranmamış / aranıyor / boş / adaylar / adres onaylı / hata |
| Kanal fiyatları | `PilotQuotes` | Ham price/tax/total; sorguya ait stay ve alınma zamanı | Boş / fiyatlı / eksik alanlar |
| Manuel kontrol | `PilotQuotes` details | Aynı koşul teyidi, tutarlılık sonucu, not | Bekliyor / tutarlı / farklı / karşılaştırılamaz |
| Kurulum/haklar | usage page | Yerel anahtar kurulumu, saklama yaklaşımı, sağlayıcı soruları | Sağlayıcı teyidi bekleniyor |

## Etkileşim

- Açılış sadece ücretsiz yerel konfigürasyon durumunu sorar. Anahtar yokken provider düğmeleri kapalı; anahtar eklendikten sonra yenileme gerekir.
- Her otelde arama ayrı eylemdir. İlk aday seçilmez; doğru kayıt ve ad/adres teyidi olmadan fiyat getirilmez.
- Fiyatlar her zaman kendi sorgu tarih/kişi/para birimiyle gösterilir; üstteki koşulların değiştirilmesi önceki fiyatın koşulunu değiştirmez. Sorgu sürerken koşullar ve tüm ücretli düğmeler kapalıdır.
- Yeniden arama eski seçimi/fiyatı kaldırır; yeni aday veya adres onayı değişimi önceki fiyatı kaldırır.
- Koşul teyidi olmadan 'tutarlı' veya 'farklı' sonucu seçilemez. Otomatik fiyat eşitliği, piyasa ortalaması veya fiyat uygulaması yoktur.
- Kanal tablosu dar ekranda kendi içinde kaydırılır. Kontroller etiketli; hatalar alert olarak duyurulur.
- Tüm seçim/fiyat/notlar sayfaya ait RAM'dedir; gezinme/yenileme sıfırlar. Kalıcı fiyat arşivi için izin beklenir.

## Kaynak

- `src/app/(workspace)/competitors/page.tsx`, `usage/page.tsx`
- `src/components/competitors/makcorps-pilot.tsx`, `pilot-hotel-card.tsx`, `pilot-quotes.tsx`
- `src/data/pilot-hotels.ts`; `src/app/globals.css`

## Bağlı backend

[Makcorps pilot akışı](../backend/makcorps-pilot.md).
