# Makcorps Antalya pilotu

Durum: **Entegrasyon hazır; canlı fiyat doğrulaması sağlayıcı hataları ve istek/kredi sınırıyla engelli.** Yerel anahtar tanımlandı; Account API HTTP 200 ile cevap verdi. Beş hedefin tamamında `/mapping` HTTP 400 döndü; fiyat endpoint'i doğrulanmış ID olmadığı için çağrılmadı. Sağlayıcı sözleşmesi teyidi de bekleniyor. OTA-270 son yenilemesinde sağlayıcı HTTP 429 istek/kredi sınırı ve Porto Bello için HTTP 410 döndü. Doğrulanmış kapsam veya fiyat doğruluğu sonucu henüz yok. İnceleme tarihi: 24 Kasım 2026.

## Canlı deneme sonucu

| Hedef | Mapping | Fiyat doğruluğu |
| --- | --- | --- |
| Akra Antalya | HTTP 400 | Kontrol edilemedi |
| Akra V | HTTP 400 | Kontrol edilemedi |
| Rixos Downtown Antalya | HTTP 400 | Kontrol edilemedi |
| Porto Bello Hotel Resort & Spa | HTTP 400 | Kontrol edilemedi |
| SeaLife Family Resort Hotel | HTTP 400 | Kontrol edilemedi |

İki ilk arama ve bir sade adla teşhis denemesi, ardından diğer üç hedef olmak üzere altı mapping isteği yapıldı. Teşhis yanıtı yalnızca genel hata içerdi. Bir Account API kontrolü HTTP 200 döndü; bu, mapping erişiminin veya otel kapsamının kanıtı değildir. Otel fiyatı kaydedilmedi; başka provider ID'si tahmin edilerek bu engel aşılmadı. Makcorps desteğinden `/mapping` erişimi/servis durumu ve plan kapsamı teyit edilmeli. Yeniden denemeler otomatik yapılmaz.

## Çalıştırma

Test bağımlılıklarıyla uyumlu Node sürümü: 22.22.2+, 24.15.0+ veya 26+ (package.json aralığı). Yerelde doğrulanan sürüm 22.22.2.

1. `.env.local` dosyasına `MAKCORPS_API_KEY=...` ekleyin. Anahtarı git'e veya sohbet mesajına koymayın.
2. `pnpm dev --port 3005` ile başlatın. Dev script'i yalnızca `127.0.0.1` üzerinde dinler; bunu herkese açık ağ adresiyle değiştirmeyin veya dev sunucusunu proxy/tünel ile yayınlamayın.
3. `http://127.0.0.1:3005/competitors` adresini açın. Ortak tarih, 1 oda, yetişkin ve para birimini seçin.
4. Fiyat sayfası beş oteli açılışta bir kez toplu sorgular. Daha önce doğrulanmış ID veya tekil ad/şehir/adres/bina eşleşmesi varsa fiyat alınır. Belirsiz kaydı `/competitors/setup` sayfasında sağlayıcı adı/adresiyle resmî kaynaktan kontrol edin. İlk aday otomatik seçilmez; eksik adresi sağlayıcıdan doğrulamadan onaylamayın.
5. Setup sayfasında doğru kaydı seçip adres onayından sonra manuel fiyat getirebilirsiniz. Ana fiyat sayfasına döndüğünüzde geçerli eşleşme otomatik kullanılır. Eksik fiyat veya boş yanıtı 'otel dolu' diye yorumlamayın.
6. Aynı OTA üzerinde aynı tarih, kişi, oda, pansiyon, iptal, vergi, para birimi ve gecelik/toplam bazını manuel kontrol edin. OTA sayfasındaki gözlem zamanını, değerleri ve varsa farkı oturumluk kontrol notuna yazın. Koşullar bilinmiyorsa 'karşılaştırılamıyor' seçin.

Production POST kapalıdır (403). Bu, hesap/tenant yetkilendirmesi olmayan yerel bir pilot. Origin/Host kontrolü tek başına kimlik doğrulama değildir; loopback bind zorunludur. Üretime geçişte hesap yetkilendirmesi ve kalıcı dağıtık bütçe sınırı gerekir. Otel verileri tenant verisi değildir; uygulama kendi fiyat kararlarını değiştirmez.

## Oteller ve adres kaynakları

| Otel | Adres | Resmî kaynak |
| --- | --- | --- |
| Akra Antalya | Şirinyalı Mah. Lara Cad. No:24, Muratpaşa / Antalya | [Akra iletişim](https://www.akrahotels.com/tr/iletisim/) |
| Akra V | Yeşilbahçe, Metin Kasapoğlu Cd. No:281, Muratpaşa / Antalya | [Akra iletişim](https://www.akrahotels.com/tr/iletisim/) |
| Rixos Downtown Antalya | Sakıp Sabancı Bulvarı, Falez Mevkii, 07050 Muratpaşa / Antalya | [Accor otel sayfası](https://all.accor.com/hotel/B1K0/index.en.shtml) |
| Porto Bello Hotel Resort & Spa | Liman Mah. No:4A/4B, 07130 Konyaaltı / Antalya | [Porto Bello iletişim](https://www.portobello.com.tr/tr/contact) |
| SeaLife Family Resort Hotel | Gürsu Mahallesi, GMK Bulvarı, Konyaaltı / Antalya | [SeaLife resmî site](https://www.sealifehotel.com/en) |

Bu liste sağlayıcı kapsamı olarak sunulmaz. Farklı segmentler entegrasyon kapsamını sınamak içindir; hepsi aynı fiyat segmentinin rakibi olarak kabul edilmez. Sağlayıcı ID'leri uydurulmaz; `/mapping` yanıtından alınır.

## API ve maliyet

- [Mapping API](https://www.makcorps.com/documentation/mapping-api/): `name`; HOTEL kayıtlarındaki `document_id`, isim ve `details.address` gösterilir; GEO kayıtları elenir.
- [Hotel API](https://www.makcorps.com/documentation/hotel-api-search-by-hotel-id/): `hotelid`, `checkin`, `checkout`, `adults`, `rooms`, `cur`. En fazla 14 gece, bugün ile bir yıl içinde giriş; pilotta tek oda ve 1–4 yetişkin.
- Beş otel için ilk arama + fiyat turu en fazla 10 HTTP isteği; kredi karşılığı hesap/plan üzerinde kontrol edilmelidir. Tek seferde bir provider isteği; process başına saatte 20 istek. Başarısız dış istek de bütçeye dahildir. Restart bütçeyi sıfırlar; bu sınır fatura garantisi değildir.
- OTA-270: ana sayfa açılışında beş hedef için bir toplu tur; sonrasında yalnızca açık yenileme. Otomatik polling ve retry yok. Otel filtreleme provider çağrısı yapmaz. 30 sn timeout; redirect yasak; sabit API host'u. Anahtar yalnızca server'da çözülür ve tarayıcı yanıtlarına/loglara taşınmaz; sorgu parametresi gerektiren provider URL'lerini ayrıca loglamayın.
- Fiyat, vergi, varsa `TotalpriceN` alanları **ham gösterim** olarak korunur. Belgede alanların gecelik/toplam bazının, oda ve pansiyon/iptal ayrımının kesin semantiği bulunmadığı için toplam/gecelik hesap veya otomatik piyasa ortalaması yapılmaz. İstenen para birimi, sağlayıcının tutarı bu birimde doğruladığı anlamına gelmez.
- [Room-Type API](https://www.makcorps.com/documentation/room-type-api/) ilk pilotta çağrılmaz; ID uyumu, alan semantiği ve kredi maliyeti sağlayıcıyla doğrulanmalı.

## Saklama ve kullanım

Ham fiyat/vergi/sonuç/not için DB, dosya, localStorage, sessionStorage veya indirme yok. Browser verileri sayfa belleğinde; sağlayıcı eşleşmelerinden yalnızca aday ve doğrulanmış ID'ler server process belleğinde 30 dakika geçerli tutulur (her hedef için son arama eski ID'leri değiştirir; restart siler). Tarayıcı ve fetch için `no-store`. Ayrı hava durumu SQLite arşivi etkilenmez.

[Genel koşullar](https://www.makcorps.com/terms/) 14 Ocak 2021 revizyonlu, web sitesi materyallerini kapsayan kısıtlı bir lisans ve ücretli platform koşulları içeriyor. Bunlar API fiyatlarının SaaS içinde gösterilmesi, tarihçe olarak saklanması ve türetilmiş fiyat analizi haklarını açıkça çözmüyor. Kayıt sayfasının `terms-and-privacy` bağlantısı inceleme sırasında 404 döndü. **Bu belirsizlik kullanım izni veya kullanım yasağı hükmü olarak yorumlanmıyor; API planına özgü sözleşme ve yazılı teyit bekleniyor.**

Teyit gelene kadar kalıcı fiyat arşivi ve müşteri yayını etkinleştirilmez. E-posta gönderilmedi; aşağıdaki metin sağlayıcıya iletilmek üzere hazırlandı.

## Sağlayıcıya gönderim taslağı

To: info@makcorps.com  
Subject: Antalya hotel pricing pilot — coverage, rate semantics and data usage rights

Hello Makcorps team,

We are evaluating your API for an internal dynamic pricing pilot with five hotels in Antalya: Akra Antalya, Akra V, Rixos Downtown Antalya, Porto Bello Hotel Resort & Spa, and SeaLife Family Resort Hotel. We plan to match properties by name and official address, then compare rates for identical stay conditions.

On November 24, 2026, `/account` returned HTTP 200 for our configured key, but `/mapping` returned HTTP 400 for all five hotel searches with a generic error. Could you first confirm whether Mapping API access is enabled for our account and whether the endpoint is operational? We will share our account identifier through your secure support channel; we will not include the API key in email.

Before enabling persistent storage or customer-facing use, could you confirm in writing:

1. Does our API plan allow displaying prices and taxes to hotel managers inside our commercial SaaS product, including competitor rate comparisons and derived pricing recommendations?
2. May we retain raw rates, taxes, hotel mappings and derived aggregates? Please specify retention limits, historical analytics rights, deletion obligations, and post-termination restrictions.
3. Are third-party OTA redistribution/display rights included? What attribution, link-back, geographic or customer limitations apply?
4. In `/hotel`, are `priceN`, `taxN` and `TotalpriceN` per night or per stay, per room or all rooms? Are taxes included, additional or potentially payable at the property? How are currency, discounts and missing values represented?
5. Can we reliably identify room type, board basis, occupancy, cancellation/refundability and mandatory fees? Does `/roomtype` use the same property IDs as `/mapping`, and which parameters/currencies does it support?
6. Are these five hotels covered? What do empty/incomplete results mean, and what freshness/accuracy guarantees and support are available?
7. What are the credit costs and rate limits for mapping, hotel and room-type requests, including empty results, errors and repeat calls? What historical data and licensing options are available?

Please send the applicable API agreement and any additional commercial licensing terms. We can provide our account identifier through your secure support channel.

Thank you.

## Pilot ölçümü

Canlı tur sonrasında hedef başına: doğru ad/adres eşleşmesi; fiyatlı kanal sayısı / toplam dönen kanal; yanıt zamanı; alan eksikleri; manuel aynı-koşul kontrolü ve tutarsızlıklar. Aynı sorguyu bir hafta sonu ve bir hafta içi için açıkça çalıştırarak kapsamı kontrol edin. İşlevsel testler canlı kapsam veya fiyat doğruluğu kanıtı değildir. Pilot sonucunda 5/5 doğru eşleşme hedeflenir; karşılaştırılamayan veya fiyat dönmeyen oteller ayrıca raporlanır. Kalıcı sonuç raporu, izin durumu netleştirildikten sonra saklanır.
