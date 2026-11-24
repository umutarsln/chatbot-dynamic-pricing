# Makcorps Antalya pilotu

## Tetik

`GET /api/competitors/pilot`: yalnızca kurulum durumu. `POST`: açık otel arama veya fiyat getirme eylemi. Sayfa açılışı ücretli API isteği yapmaz.

## Girdi

POST aynı yerel Origin/Host; production yasak. JSON en fazla 2 KiB. `action: mapping | rates`, `hotel`: beş hedefin allowlist ID'si. `rates` ayrıca önceki mapping yanıtındaki `hotelId`, `addressConfirmed: true`, gerçek ve gelecekteki `checkin/checkout` (1–14 gece, en fazla 1 yıl ileride giriş), `adults: 1..4`, `rooms: 1`, `currency: TRY | EUR | USD` ister.

## Çıktı

GET `{ configured, local }`; anahtar dönmez. Mapping `{ candidates: [{ id, name, address, location }] }`. Rates `{ hotelId, stay, fetchedAt, quotes: [{ vendor, price, tax, total }] }`. Eksikler null, fiyatlar ham string; birim veya toplam hesaplanmaz. Yanıtlar no-store. 400 girdi/eşleşme; 403 kaynak/production; 413 gövde; 415 içerik tipi; 429 meşgul/bütçe/provider; 503 eksik anahtar; 502 provider/ağ/şema; 500 güvenli genel hata.

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
