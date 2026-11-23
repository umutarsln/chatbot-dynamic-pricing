---
name: project-context
description: Reads the living context index and keeps UI schemas plus backend flow docs in sync. Use when starting a chat, changing screens, APIs, data, or reputation features; when the user mentions bağlam, context, INDEX, şema, UI, backend, itibar, or yorum.
---

# Proje bağlamı

Kod taramadan önce yaşayan indeksi oku. Ayrıntı yalnızca ilgili dosyadan gelir.

## İş akışı

1. `docs/context/INDEX.md` oku.
2. Terim için `docs/context/domain.md` oku.
3. Ekran işi ise indeksteki şema dosyasını oku. Yoksa `docs/context/ui/` altında yeni dosya aç.
4. API, veri veya sunucu işi ise indeksteki akış dosyasını oku. Yoksa `docs/context/backend/` altında yeni dosya aç.
5. Kodu değiştir.
6. İlgili dokümanı **aynı turda**, yerinde güncelle. Değişiklik günlüğü yazma.
7. Ekran veya akış eklendi, silindi ya da yeniden adlandırıldıysa indeks satırını güncelle.
8. Teslim: şema veya akış dosyası (ve gerekirse indeks) bu turda güncellenmediyse iş bitmedi.

İndekste kayıtlı ürün davranışını anlamak için repoyu baştan tarama. Doküman ile kod çelişirse kodu doğrula, dokümanı düzelt.

## Ne zaman hangi skill

- Görünen arayüz → `ui-schema`
- Backend akışı → `backend-steps`

## Ek kaynaklar

- Arayüz alanları ve indeks satırı: [ui-schema.md](ui-schema.md)
- Backend alanları ve indeks satırı: [backend-steps.md](backend-steps.md)
