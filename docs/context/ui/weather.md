# Hava durumu sayfası

`/weather` sayfası Antalya merkez açılış verisini bir kez alır. Bölge kontrolü Lara, Belek, Kemer, Side, Alanya ve Kaş için tahmin alır. Menüdeki Hava durumu bağlantısı `/weather` sayfasına gider. Diğer sayfalarda panel mount edilmez ve hava isteği başlatılmaz.

Sahip: `src/components/weather/weather-panel.tsx`. Konum listesi: `src/data/weather-regions.ts`. [Backend akışı](../backend/weather.md).

- Sade current özeti: sıcaklık, durum, hissedilen, rüzgâr ve nem.
- Bugünden başlayan günlük hücrelerde tarih/gün, durum, max/min sıcaklık, yağış olasılığı ve miktarı.
- Kaynak bağlantısı ve TSİ model zamanı; bölge merkezine ait model tahmini olduğu belirtilir.
- Loading: bölge adı ve skeleton/status. Error: eski bölgeyi göstermeyen alert ve Tekrar dene. Null değer: `—`; sıfır korunur.
- İlk mount isteği Strict Mode effect tekrarında dedupe edilir. Polling veya focus yenilemesi yoktur; oda tipi/fiyat ufku panel isteğini etkilemez. Eski yanıt yeni seçimi ezemez.
- Mobilde özet alt alta ve günlük görünüm iki sütundur. Bölge seçimi etiketli native select, hata eylemi klavye erişimli button'dur.
- Hava verisi gerçektir; diğer fiyat/doluluk alanları örnektir. Otomatik fiyat değişikliği yoktur. Geçmiş sorgu ve saklama ayrı `/weather/history` sayfasındadır.

## Geçmiş görünümü

Sahip: `src/components/weather/weather-history.tsx`. `/weather` alt layout'u tahmin/geçmiş sekmelerini paylaşır. Bölge seçimi kayıtlı son 30 günü okur. Kullanıcı tarih aralığıyla **Getir ve kaydet** eylemini çalıştırır; yalnızca eksik günler sağlayıcıdan getirilir. Bölgede toplam kayıt, kayıtlı günlerin sıcaklık ortalaması/yağış toplamı, gösterilen/talep edilen gün sayısı ve günlük tablo görünür. Kayıt zamanı ve arşiv kapsamı belirtilir. Hata mevcut arşivi silmez. Node/SQLite veya hata ayrıntıları ürün akışına taşınmaz. [Arşiv backend](../backend/weather-history.md).
