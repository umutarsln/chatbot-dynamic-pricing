# Antalya hava durumu

## Tetik

`GET /api/weather` — hava durumu sayfası açılışı, bölge değişimi veya açık tekrar deneme.

## Girdi

İsteğe bağlı `region`: `antalya` (varsayılan), `lara`, `belek`, `kemer`, `side`, `alanya`, `kas`. Bu public endpoint tenant veya özel otel verisi okumaz.

## Çıktı

`WeatherReport`: bölge, alınma zamanı, mevcut koşullar ve 7 güne kadar günlük tahmin. Zaman dilimi Europe/Istanbul; birimler °C, km/sa, mm. 400 geçersiz bölge, 502 upstream/veri hatası. Başarı yanıtı public cache: browser 300 sn / shared 900 sn; hata no-store.

## Bağımlılık

Open-Meteo Forecast API; isteğe bağlı server-only `OPEN_METEO_API_KEY`. [Sağlayıcı karşılaştırması](../../integrations/weather-data.md).

## Adımlar

1. Query ve bölge allowlist'ini doğrula — dosya: `src/app/api/weather/route.ts`, `src/data/weather-regions.ts` — yan etki: yok — hata: bilinmeyen veya tekrarlanan region için 400.
2. Server anahtarını çöz — dosya: `src/services/weather/open-meteo.ts` — yan etki: yok — hata: anahtar yoksa prototip endpoint'i kullanılır.
3. Sabit provider host'una koordinat, birim ve gün sayısıyla istek gönder — dosya: `src/services/weather/open-meteo-client.ts` — yan etki: dış HTTP GET — hata: 8 sn timeout, ağ, yönlendirme veya non-2xx.
4. Provider JSON'unu normalize et — dosya: `src/services/weather/open-meteo-client.ts` — yan etki: yok — hata: şema, aralık, tarih/sıra, dizi uzunluğu veya zaman dilimi geçersiz.
5. Report veya güvenli hata dön — dosya: `src/app/api/weather/route.ts` — yan etki: HTTP yanıtı — hata: provider ayrıntılarını/anahtarı açıklamayan 502.
