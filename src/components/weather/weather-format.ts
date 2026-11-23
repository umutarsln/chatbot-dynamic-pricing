const valueFormat = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });
export const dayFormat = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" });
export const weekdayFormat = new Intl.DateTimeFormat("tr-TR", { weekday: "short", timeZone: "Europe/Istanbul" });
export const timeFormat = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

/** Formats a missing measurement as an em dash. */
export function format(value: number | null, unit: string) {
  return value === null ? "—" : `${valueFormat.format(value)}${unit}`;
}

/** Maps WMO weather codes to the Turkish label shown on the panel. */
export function weatherDescription(code: number | null) {
  if (code === 0) return "Açık";
  if (code === 1) return "Çoğunlukla açık";
  if (code === 2) return "Parçalı bulutlu";
  if (code === 3) return "Kapalı";
  if (code === 45 || code === 48) return "Sisli";
  if ([51, 53, 55, 56, 57].includes(code ?? -1)) return "Çisentili";
  if ([61, 63, 65, 66, 67].includes(code ?? -1)) return "Yağmurlu";
  if ([71, 73, 75, 77].includes(code ?? -1)) return "Kar yağışlı";
  if ([80, 81, 82].includes(code ?? -1)) return "Sağanak yağışlı";
  if (code === 85 || code === 86) return "Kar sağanaklı";
  if ([95, 96, 99].includes(code ?? -1)) return "Gök gürültülü";
  return "Durum bilgisi yok";
}

