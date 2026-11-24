# Makcorps Antalya pilotu

## Tetik

`GET /api/competitors/pilot`: eşleştirme sayfasında kurulum durumu. `POST action=prices`: `/competitors` açılışında bir kez tüm hedefler; sonrasında yalnızca açık yenileme. `POST action=mapping|rates`: `/competitors/setup` içindeki manuel işlemler. Otel filtresi ağ isteği üretmez.

## Girdi

POST aynı yerel Origin/Host; production yasak. JSON en fazla 2 KiB. `action: prices | mapping | rates`. Prices: `hotels` 1–5 benzersiz allowlist ID ve konaklama koşulları. Mapping/rates: `hotel` allowlist ID. Rates: önceki mapping yanıtındaki `hotelId`, `addressConfirmed: true`. Prices/rates: gerçek ve gelecekteki `checkin/checkout` (1–14 gece, en fazla 1 yıl ileride giriş), `adults: 1..4`, `rooms: 1`, `currency: TRY | EUR | USD`.

## Çıktı

GET `{ configured, local }`; anahtar dönmez. Mapping `{ candidates: [{ id, name, address, location }] }`. Rates `{ hotelId, stay, fetchedAt, quotes: [{ vendor, price, tax, total }] }`. Prices `{ stay, fetchedAt, hotels: [{ hotel, status, result?, message? }] }`; durum `ready|empty|needs-mapping|error`. Eksikler null, fiyatlar ham string; birim veya toplam hesaplanmaz. Yanıtlar no-store. 400 girdi/eşleşme; 403 kaynak/production; 413 gövde; 415 içerik tipi; 429 meşgul/bütçe/provider; 503 eksik anahtar; 502 provider/ağ/şema; 500 güvenli genel hata. Toplu turda otel bazındaki provider hatası yalnız o satırı etkiler; diğer oteller devam eder. Ortak girdi veya eksik anahtar bütün isteği reddeder.

## Bağımlılık

Server-only `MAKCORPS_API_KEY`; sabit `https://api.makcorps.com` host'u. Ayrıntı ve izin talebi: [Entegrasyon](../../integrations/makcorps-pilot.md). Tenant oturumu yok; yalnızca loopback geliştirme sunucusu. Üretimde ödeme yapan API çağrıları kapalı.

## Adımlar

1. Kaynağı ve production sınırını denetle — dosya: `src/app/api/competitors/pilot/route.ts`, `src/services/competitors/makcorps-contract.ts` — yan etki: yok — hata: 403.
2. JSON ve gerçek gövde byte sınırını doğrula — dosya: `src/app/api/competitors/pilot/route.ts` — yan etki: request stream okuma — hata: 400/413/415.
3. Server anahtarı, hedef/işlem allowlist ve konaklama koşullarını doğrula — dosya: `src/services/competitors/pilot.ts`, `makcorps-contract.ts`, `src/data/pilot-hotels.ts` — yan etki: yok — hata: 400/503.
4. Rates için hedefe ait, son 30 dakikada dönen mapping ID'sini ve kullanıcı adres teyidini zorunlu tut — dosya: `src/services/competitors/pilot.ts` — yan etki: yok — hata: 400.
5. Tek eşzamanlı istek ve process başına saatte 20 çağrı sınırını uygula — dosya: `src/services/competitors/pilot.ts` — yan etki: RAM bütçesi, restart ile sıfırlanır — hata: 429. Başarısız dış çağrı da sayılır.
6. Provider'a bir defa GET gönder — dosya: `src/services/competitors/makcorps-client.ts` — yan etki: API kredisi tüketebilir; 30 sn timeout/no-store/redirect error; otomatik retry yok — hata: 429 veya güvenli 502, credential taşıyan orijinal hata aktarılmaz.
7. HOTEL adaylarını veya nested/indexed fiyat alanlarını normalize et — dosya: `src/services/competitors/makcorps-contract.ts` — yan etki: yok — hata: 502 şema.
8. Mapping ID'lerini RAM'de hedef başına değiştir veya fiyatları istemciye dön — dosya: `src/services/competitors/pilot.ts`, `src/app/api/competitors/pilot/route.ts` — yan etki: sadece geçici ID kaydı; fiyat DB/dosya kaydı yok — hata: genel 500. Aynı hedefte yeniden mapping eski ID listesini değiştirir; fiyat yanıtı kalıcılaştırılmaz.

## Toplu açılış turu (OTA-270)

1. Bütün otel listesini ve stay koşullarını dış çağrı öncesi doğrula — dosya: `src/services/competitors/pilot.ts:getHotelPrices` — yan etki: yok — hata: boş, tekrarlı veya bilinmeyen hedef 400; eksik anahtar 503.
   Aynı stay ve otel kümesiyle eşzamanlı açılan sayfalar sürmekte olan Promise'i paylaşır; bitince RAM kaydı silinir, tamamlanmış fiyat önbelleği tutulmaz. Farklı sorgular mevcut provider eşzamanlılık sınırına tabidir.
2. Hedefleri sırayla işle; 30 dakika geçerli, daha önce doğrulanmış ID varsa yeniden mapping yapma — dosya: `src/services/competitors/pilot.ts` — yan etki: RAM okuma — hata: süresi geçmiş/uyuşmayan ID tekrar eşleşmeye gider.
3. Eşleşme gerekiyorsa bir mapping isteği yap; tek adayda normalize edilmiş ad, Antalya, en az iki adres belirteci ve mevcut bina numaralarının tümü uyuşmalı — dosya: `makcorps-contract.ts:matchHotel`, `pilot.ts` — yan etki: mapping API kredisi; sadece ID belleği — hata: belirsiz/çoklu/eksik adres için `needs-mapping`, fiyat çağrısı yapılmaz.
4. Doğrulanan ID ile tek fiyat çağrısı yap; ortak stay korunur — dosya: `pilot.ts:runPilot`, `makcorps-client.ts` — yan etki: API kredisi; doğrulanan ID RAM'de mapping TTL'siyle tutulur — hata: satır bazında güvenli provider hatası. Bütçe her dış çağrı için ortak 20/saat, retry/polling yok.
5. Tüm sonuçları tek raporda dön — dosya: `pilot.ts:getHotelPrices`, route — yan etki: HTTP JSON; fiyatlar kalıcılaştırılmaz — hata: bilinmeyen hata ayrıntıları gizlenir. İlk tur en çok 10, geçerli eşleşmelerle en çok 5 dış çağrı; browser tek POST yapar.
