---
name: ui-schema
description: Documents each visible screen as a living UI schema. Use when adding or changing pages, layouts, components, empty/loading/error states, or interactions; when the user mentions şema, ekran, UI, arayüz, reputation inbox, or yorum listesi.
---

# Arayüz şeması

Görünen her ekran için `docs/context/ui/` altında tek bir yaşayan dosya tut. Değişiklik günlüğü yazma; dosyayı yerinde güncelle. Aynı turda `docs/context/INDEX.md` satırını hizala.

## Şablon

```markdown
# [Ekran adı]

## Rota

`/path`

## Amaç

Tek cümle: bu ekran kimin hangi işini bitirir.

## Aktör

Kim görür, hangi otel veya rol bağlamı gerekir.

## Düzen

Kısa yerleşim notu (sütun, panel, üst çubuk).

| Bölge | Bileşen | Veri | Durumlar |
| --- | --- | --- | --- |
| [sol liste] | [InboxList] | [yorum özeti] | boş / yükleniyor / hata / dolu |

## Etkileşim

- Tıklama, gönderim, gezinme ve bunların sonucu.

## Kaynak

- Sayfa veya bileşen dosya yolu.

## Bağlı backend

- `docs/context/backend/<akis>.md` veya "Yok".
```

## Örnek (ana sayfa)

Mevcut karşılama ekranı `docs/context/ui/home.md` içindedir. Yeni itibar ekranı yazarken aynı başlıkları kullan; statik başlangıç sayfasını kopyalama.

```markdown
# Gelen kutusu

## Rota
`/inbox`

## Amaç
Otelin yanıt bekleyen yorumlarını listeler.

## Aktör
Giriş yapmış otel yöneticisi. Aktif otel oturumdan gelir.

## Düzen
Sol liste, sağ ayrıntı.

| Bölge | Bileşen | Veri | Durumlar |
| --- | --- | --- | --- |
| Liste | InboxList | yorum özeti | boş / yükleniyor / hata / dolu |
| Ayrıntı | ReviewDetail | tam yorum | boş (seçim yok) / dolu |

## Etkileşim
- Satıra tıklayınca ayrıntı açılır.
- "Yanıtla" taslak paneline gider.

## Kaynak
- `src/app/inbox/page.tsx`

## Bağlı backend
- `docs/context/backend/yorum-listele.md`
```
