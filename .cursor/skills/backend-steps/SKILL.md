---
name: backend-steps
description: Documents each backend flow as numbered steps with files, side effects, and errors. Use when adding or changing API routes, data access, server actions, jobs, or channel sync; when the user mentions backend, akış, adım, API, yorum, yanıt, or reputation pipeline.
---

# Backend adımları

Her backend akışı için `docs/context/backend/` altında tek bir yaşayan dosya tut. Değişiklik günlüğü yazma; dosyayı yerinde güncelle. Aynı turda `docs/context/INDEX.md` satırını hizala.

## Şablon

```markdown
# [Akış adı]

## Tetik

Ne başlatır: HTTP yöntemi ve yol, sunucu eylemi, iş kuyruğu.

## Girdi

Kimlik, gövde, sorgu. Zorunlu ve isteğe bağlı alanlar.

## Çıktı

Başarı gövdesi veya yan etki (kayıt, dış çağrı).

## Bağımlılık

Veri deposu, kanal API, yetki.

## Adımlar

1. [Adım] — dosya: `path` — yan etki: yok — hata: [durum]
2. [Adım] — dosya: `path` — yan etki: [ne yazılır] — hata: [durum]
```

Her adımda üç alan zorunlu: **dosya**, **yan etki**, **hata**. Yan etki yoksa "yok" yaz.

## Örnek biçim (henüz kodda yok)

Bu örnek yalnızca doküman biçimini gösterir; uygulamada bu akış yoktur.

```markdown
# Yorum listele

## Tetik
`GET /api/reviews`

## Girdi
Oturumdaki otel kimliği. İsteğe bağlı: `status`, `channel`.

## Çıktı
`{ reviews: ReviewSummary[] }`

## Bağımlılık
Oturum doğrulama. Yorum tablosu.

## Adımlar
1. Oturumu doğrula — dosya: `src/services/auth/session.ts` — yan etki: yok — hata: 401
2. Yorumları süz — dosya: `src/app/api/reviews/route.ts` — yan etki: yok — hata: 500
3. Özet döndür — dosya: `src/app/api/reviews/route.ts` — yan etki: yok — hata: yok
```
