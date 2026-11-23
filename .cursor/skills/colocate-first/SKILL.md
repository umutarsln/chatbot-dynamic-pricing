---
name: colocate-first
description: Places new hotel-reputation code in the existing owner file and blocks speculative folders, barrels, and pass-through wrappers. Use when creating or splitting files, adding folders, or choosing where review, reply, channel, or auth code goes; when the user mentions dosya, klasör, colocate, slop, wrapper, over-engineer, or file placement. Do not use for deslop, AI-slop-cleaner, or AI-app architecture.
---

# Colocate first

Yeni dosya, yeni klasör veya mevcut dosyayı bölme bu turdaysa bu skill’i oku. Yerinde küçük düzenlemede `colocate-first` kuralı yeter.

## Ne zaman değil

- Teslim sırası → `minimal-first`
- Nasıl yazılacağı (katman, YAGNI) → `write-simple`
- Yorum dili → `english-comments`
- Test colocasyonu → `testing`
- Stil / `any` / iç içe if temizliği → kişisel `deslop` (`~/.claude/skills/deslop/SKILL.md`)
- Sarmalayıcı, kopya, ölü kod geçişi → kişisel `ai-slop-cleaner` (`~/.claude/skills/ai-slop-cleaner/SKILL.md`)
- generateText vs Agent vs tool / RAG / chat → `ai-architect` subagent

Özellik yazarken deslop / ai-slop-cleaner / ai-architect yükleme.

## Bu repo

Klasör seçimi `src-layout` kuralında. Bu skill aynı klasörün içinde geçerlidir: yeni sorumluluk, o işi yapan dosyaya gider.

- Sayfa: `src/app/<ekran>/page.tsx`. Route: `src/app/api/.../route.ts`
- Bileşen `src/components/<özellik>`, paylaşılan hook `src/hooks`, servis `src/services/<özellik>`, veri `src/data`, tarayıcı depo `src/storage`, betik `src/scripts`
- `src/lib`, `src/utils`, `src/helpers` açma. Hook ve servis klasörü ancak `src-layout` satırı dolunca açılır
- Harita: `docs/context/` (changelog yok)

## Colocate vs böl

- Yorum listesi + aktif otel aynı yerde kalsın.
- Kanal adaptörünü yanıt metninden ayır.
- Oturum/auth, inbox UI her ikisi de büyüyünce ayır.
- Test: `foo.ts` yanında `foo.test.ts`

## Yazarken koku

Yasak: geçiş sarmalayıcı, imzayı tekrarlayan yorum, boş klasör, kullanılmayan export, barrel `index.ts`. Bu skill temizlik workflow’u çalıştırmaz.

## Escalation

Kullanıcı `deslop` / `AI slop` / anti-slop dediyse veya yeni bir AI yüzeyi (yanıt modeli, inbox agent, MCP) seçiliyorsa ilgili kişisel skill veya `ai-architect` oku. Gövdelerini buraya kopyalama.
