# Geçmiş hava verisi arşivi

## Tetik

`GET /api/weather/history` kayıtlı günleri okur. `POST /api/weather/history` kullanıcının **Getir ve kaydet** eylemidir; eksik günleri sağlayıcıdan alır ve kaydeder. `/weather/history` arayüzü bu akışı kullanır. Zamanlanmış/otomatik günlük backfill yoktur.

## Girdi

Allowlist'teki Antalya `region`, ISO `startDate` ve `endDate`. GET varsayılanı son 30 kullanılabilir gündür; POST üç alanı da ister. Aralık en fazla 366 gün, başlangıç en erken 1940-01-01, bitiş en geç İstanbul bugününden 7 gün öncesidir. ERA5'in yaklaşık 5 günlük gecikmesi için 7 gün tampon kullanılır. Tarihler geçerli takvim günleri ve artan sırada olmalıdır. İstemci path/host/model/koordinat seçemez.

## Çıktı

Bölge, tarih aralığı, `ERA5` modeli, en erken/en geç alınabilir gün, günlük kayıtlar, beklenen gün sayısı, yeni kaydedilen gün sayısı, bölgede toplam arşiv sayısı ve ilk/son kayıt tarihi. Günlük veri: WMO kodu, min/max/ortalama °C, toplam mm yağış ve maksimum km/sa rüzgâr, saklanma zamanı. Günlük geçmişte yağış olasılığı uydurulmaz.

400 geçersiz input/JSON; 403 farklı Origin; 413 2 KiB üzerinde gövde; 415 JSON olmayan POST; 502 sağlayıcı hatası; 500 depolama hatası. Yanıtlar `no-store`; SQLite kanonik kaynaktır. Hatalar provider anahtarını veya DB yolunu açıklamaz.

## Bağımlılık

- Open-Meteo `/v1/archive`, `models=era5`; anahtarsız değerlendirme host'u `archive-api.open-meteo.com`, ticari anahtarla `customer-archive-api.open-meteo.com`. Ticari Historical API erişimi Professional veya üzeri plan gerektirir.
- Node 22.18+ `node:sqlite`; Node 22'de SQLite API'si experimental uyarısı verir. Ek çalışma zamanı veritabanı paketi yoktur.
- Varsayılan dosya: proje kökünde **`var/weather.sqlite`**; git dışında ve `public` dışında tutulur. `WEATHER_HISTORY_DB_PATH` ile başka bir kalıcı diske taşınabilir. Bu yerel dosya server restart'larında kalır; geçici/serverless dosya sistemi veya silinen container diskinde kalıcılık garanti edilmez. Üretimde kalıcı volume veya merkezi DB gerekir.

Bu shared public weather arşividir; tenant veya misafir kaydı içermez. Endpoint public'tir ve bölge/tarih/model bakımından sınırlandırılır; POST tarayıcı Origin kontrolü ve JSON gereksinimi taşır. Komut satırı aktarımı için Origin'siz istekler kabul edilir. Ücretli endpoint'in dış kullanıma açılması uygulama kimliği/kota sınırlarıyla ele alınmalıdır.

## Depolama ve yaşam döngüsü

`weather_history_era5` STRICT tablosu, `(region_id, latitude, longitude, date)` birincil anahtarıyla günlük kayıt tutar. Model tablo adıyla ayrıdır; koordinat değişiklikleri eski seriyle karışmaz. Bir batch `BEGIN IMMEDIATE`/commit/rollback ile atomik yazılır; WAL ve 5 saniye busy timeout kullanılır. Her işlem bağlantıyı kapatır; ağ isteği sırasında DB write lock tutulmaz.

Tekrar veya eşzamanlı aktarım `ON CONFLICT DO NOTHING` ile çoğalmaz; mevcut snapshot değiştirilmez. Okumalar seçili aralıkta ve tarih sıralıdır. İstenen günler zaten kayıtlıysa provider çağrısı yapılmaz. Eksik günlerin ilk/son tarihi arasında tek bounded provider isteği yapılır; ara günlerde zaten saklı kayıtlar korunur. Eksik/null sıcaklıklarla henüz tamamlanmamış yanıt yazılmaz. Diğer null ölçümler korunur ve `—` gösterilir. Bozuk/kısmi provider yanıtında hiçbir yeni kayıt yazılmaz.

Otomatik silme/TTL yoktur; geçmiş analiz için saklanır. İlk yerel aktarım, 7 bölgede **2025-11-18–2026-11-17**, her bölge 365 olmak üzere **2.555 günlük** kayıttır. Kaynak yeniden analiz ürünüdür; istasyon gözlemi ya da geçmişte yayınlanan forecast değildir. Çok eski dönemlerde provider'ın günlük timezone/UTC-offset davranışı kendi sözleşmesine tabidir.

## Adımlar

1. Yöntem, Origin/JSON, bölge ve tarihleri doğrula — dosya: `src/app/api/weather/history/route.ts`, `src/services/weather/history-range.ts` — yan etki: yok — hata: 400/403/413/415; provider'a erişilmez.
2. Arşiv kapsamını ve eksik tarihleri oku — dosya: `src/services/weather/weather-history.ts`, `src/services/weather/history-store.ts` — yan etki: ilk erişimde SQLite dosyası/tablosu oluşturulur — hata: depolama erişimi 500.
3. GET'te veya tam kayıtlı POST'ta kayıtları dön — dosya: `src/services/weather/weather-history.ts` — yan etki: yok — hata: okuma 500.
4. Eksik aralığı sabit archive host'undan al, doğrula — dosya: `src/services/weather/open-meteo-client.ts` — yan etki: dış HTTP GET — hata: 20 sn timeout, kota, ağ, şema/dizi/tarih/ölçüm hatası → 502; henüz yazım yok.
5. Batch'i tek transaction ile ekle ve tekrar oku — dosya: `src/services/weather/history-store.ts` — yan etki: SQLite'a yeni günler yazılır — hata: tüm batch rollback, 500; önceki kayıtlar korunur.

## Kontrol

`pnpm test`: aralık sınırları, İstanbul günü, leap day, eksik/hatalı provider yanıtı, kayıtların yeniden bağlantıda okunması, tekrar/overlap, bölge/koordinat ayrımı ve batch rollback testleri. Yerel API ile cache-hit aktarımda sıfır yeni kayıt ve gerçek ilk aktarım kontrol edilir. Kalıcı DB dosyası ve WAL/SHM sidecar'ları çalışma zamanı verisidir; commit edilmez.
