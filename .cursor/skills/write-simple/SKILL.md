---
name: write-simple
description: Writes hotel-reputation code with the smallest complete shape and pragmatic layers (UI, rules, channel adapters) without UseCase/Repository/DI or speculative ports. Use when implementing, editing, or adding src files, APIs, components, domain rules, or channel code; when the user mentions minimal, clean architecture, overengineer, YAGNI, sade, or katman.
---

# Write simple

`src/` değişiyorsa bu skill geçerli. Temizlik (`deslop`, `ai-slop-cleaner`) ve AI yüzeyi seçimi (`ai-architect`) ayrı.

## Karar sırası (her fonksiyon)

1. Bu kod olmasa da iş biter mi? Bitiyorsa yazma.
2. Çağıranın içinde durabilir mi? Durabiliyorsa ayırma.
3. Gerçekten iki tüketici veya iki implementasyon var mı? Yoksa interface/port/helper dosyası yok.

## Katman (spekülatif Clean Architecture değil)

Bu ürün küçük. Hexagonal klasör, `application/` / `infrastructure/`, mediator, event bus yok.

| Katman | Ne zaman | Nerede |
| --- | --- | --- |
| UI | Sayfa, form | `src/app` sayfası, `src/components` |
| HTTP | `route.ts` ince kalır | `src/app/api` |
| Kural | Puan ölçeği, yanıt durumu, otel kapsamı — ikinci çağıran olunca | Önce route içi; sonra `src/server` |
| Adaptör | Kanal HTTP, imza, ham payload | `src/server` |

Bağımlılık içeri: adaptör kuralı bilir, kural Next.js veya kanal SDK’sı bilmez.

## Yasak (tek implementasyon)

- `IReviewRepository`, `ListReviewsUseCase`, DI konteyner
- Tek Google istemcisi için `ChannelPort`
- `Result`/`Either` her fonksiyonda
- `src/lib/services` “doğru katman” diye

```ts
// ❌ BAD — port for one vendor
export interface ChannelPort { listReviews(hotelId: string): Promise<Review[]> }
export class GoogleChannel implements ChannelPort {}

// ✅ GOOD — Google fetch until Booking exists; then share a small type
export async function fetchGoogleReviews(hotelId: string): Promise<Review[]> {}
```

İkinci kanal (Booking) eklenince ortak tipi çıkar; o zaman ince bir birleşik imza meşru.

## Overengineering testi

Yazmadan önce: “Bunu bugün çağıran tek yer mi?” Evet ise aynı dosyada kalsın. “Yarın AI ajanı kullanır” gerekçe değil.
