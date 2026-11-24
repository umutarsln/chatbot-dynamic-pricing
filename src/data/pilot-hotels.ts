export const pilotHotels = [
  { id: "akra", name: "Akra Antalya", district: "Muratpaşa", address: "Şirinyalı Mah. Lara Cad. No:24, Muratpaşa / Antalya", source: "https://www.akrahotels.com/tr/iletisim/" },
  { id: "akra-v", name: "Akra V", district: "Muratpaşa", address: "Yeşilbahçe, Metin Kasapoğlu Cd. No:281, Muratpaşa / Antalya", source: "https://www.akrahotels.com/tr/iletisim/" },
  { id: "rixos-downtown", name: "Rixos Downtown Antalya", district: "Muratpaşa", address: "Sakıp Sabancı Bulvarı, Falez Mevkii, 07050 Muratpaşa / Antalya", source: "https://all.accor.com/hotel/B1K0/index.en.shtml" },
  { id: "porto-bello", name: "Porto Bello Hotel Resort & Spa", district: "Konyaaltı", address: "Liman Mah. No:4A/4B, 07130 Konyaaltı / Antalya", source: "https://www.portobello.com.tr/tr/contact" },
  { id: "sealife-family", name: "SeaLife Family Resort Hotel", district: "Konyaaltı", address: "Gürsu Mahallesi, GMK Bulvarı, Konyaaltı / Antalya", source: "https://www.sealifehotel.com/en" },
] as const;

export type PilotHotel = (typeof pilotHotels)[number];
