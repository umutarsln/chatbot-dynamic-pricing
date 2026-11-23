# Arayüz şeması — indeks kuralları

Ekran başına bir dosya: `docs/context/ui/<ekran>.md`.

Zorunlu alanlar: rota, amaç, aktör, düzen (bölge, bileşen, veri, durumlar: boş / yükleniyor / hata / dolu), etkileşim, bağlı backend.

Şablon ve örnek `ui-schema` skill içindedir.

## İndeks satırı

`docs/context/INDEX.md` Ekranlar tablosu:

| Rota | Amaç | Şema |
| --- | --- | --- |
| `/inbox` | Yanıt bekleyen yorumlar | [ui/inbox.md](ui/inbox.md) |

Silinen ekranın satırını kaldır. Rota değişince hem şema dosyasındaki rota alanını hem indeks satırını güncelle.
