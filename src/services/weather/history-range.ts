export type HistoryRange = { startDate: string; endDate: string };
const DAY = 86_400_000;

export class HistoryRangeError extends Error {}

export function shiftHistoryDate(date: string, days: number) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);
}

export function getHistoryBounds(now = new Date()) {
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  // ERA5 is delayed; leave seven days before importing complete daily records.
  const latestDate = shiftHistoryDate(today, -7);
  return { earliestDate: "1940-01-01", latestDate, startDate: shiftHistoryDate(latestDate, -29), endDate: latestDate };
}

export function validateHistoryRange(start: unknown, end: unknown, now = new Date()): HistoryRange {
  const valid = (value: unknown): value is string => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
    && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  if (!valid(start) || !valid(end)) throw new HistoryRangeError("Geçerli bir başlangıç ve bitiş tarihi seçin.");
  const bounds = getHistoryBounds(now);
  if (start > end) throw new HistoryRangeError("Başlangıç tarihi bitiş tarihinden sonra olamaz.");
  if (start < bounds.earliestDate || end > bounds.latestDate) throw new HistoryRangeError(`Tarihler ${bounds.earliestDate} ile ${bounds.latestDate} arasında olmalı.`);
  if ((Date.parse(end) - Date.parse(start)) / DAY + 1 > 366) throw new HistoryRangeError("Tek seferde en fazla 366 gün alınabilir.");
  return { startDate: start, endDate: end };
}

export function listHistoryDates(range: HistoryRange) {
  const length = (Date.parse(range.endDate) - Date.parse(range.startDate)) / DAY + 1;
  return Array.from({ length }, (_, index) => shiftHistoryDate(range.startDate, index));
}
