"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { rooms, occupancyPattern, pricePattern, reasons, type RoomType } from "@/data/pricing-demo";

export const dayFormat = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "UTC" });
export const weekdayFormat = new Intl.DateTimeFormat("tr-TR", { weekday: "short", timeZone: "UTC" });
export const money = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
export const decimal = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 });

function usePricingState() {
  const [horizon, setHorizon] = useState("7");
  const [roomType, setRoomType] = useState<RoomType>("standard");
  const [applied, setApplied] = useState<string[]>([]);
  const room = rooms[roomType];
  const dates = Array.from({ length: Number(horizon) }, (_, index) => {
    const date = new Date(Date.UTC(2026, 10, 24 + index));
    const weekday = date.getUTCDay();
    const pattern = (weekday + 5) % 7;
    const occupancy = occupancyPattern[pattern];
    const current = room.base;
    const suggested = Math.max(room.min, Math.min(room.max, Math.round(current * (1 + pricePattern[pattern]) / 50) * 50));
    const id = `${roomType}-${date.toISOString().slice(0, 10)}`;
    return { id, date, occupancy, sold: Math.round(room.capacity * occupancy / 100), current, suggested, reason: reasons[pattern], applied: applied.includes(id) };
  });
  const soldNights = dates.reduce((sum, day) => sum + day.sold, 0);
  const revenue = dates.reduce((sum, day) => sum + day.sold * (day.applied ? day.suggested : day.current), 0);
  const availableNights = room.capacity * dates.length;
  const occupancy = soldNights / availableNights * 100;
  const adr = revenue / soldNights;
  const pending = dates.filter((day) => day.suggested !== day.current && !day.applied);
  const range = `${dayFormat.format(dates[0].date)} – ${dayFormat.format(dates.at(-1)!.date)} 2026`;
  const competitors = [
    { name: "Sahil Park Hotel", price: Math.round(room.base * 1.06 / 50) * 50, occupancy: 82 },
    { name: "Marina Beach Resort", price: Math.round(room.base * 1.14 / 50) * 50, occupancy: 88 },
    { name: "Azure Coast Hotel", price: Math.round(room.base * .96 / 50) * 50, occupancy: 74 },
  ];
  const marketAverage = competitors.reduce((sum, hotel) => sum + hotel.price, 0) / competitors.length;

  return { horizon, setHorizon, roomType, setRoomType, setApplied, room, dates, soldNights,
    revenue, availableNights, occupancy, adr, pending, range, competitors, marketAverage };
}

const PricingContext = createContext<ReturnType<typeof usePricingState> | null>(null);

export function PricingProvider({ children }: { children: ReactNode }) {
  const pricing = usePricingState();
  return <PricingContext value={pricing}>{children}</PricingContext>;
}

export function usePricing() {
  const pricing = useContext(PricingContext);
  if (!pricing) throw new Error("PricingProvider is required");
  return pricing;
}
