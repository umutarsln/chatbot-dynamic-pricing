"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function WeatherNavigation() {
  const pathname = usePathname();
  return <nav className="weather-navigation" aria-label="Hava durumu görünümü">
    <Link href="/weather" aria-current={pathname === "/weather" ? "page" : undefined}>7 günlük tahmin</Link>
    <Link href="/weather/history" aria-current={pathname === "/weather/history" ? "page" : undefined}>Geçmiş veriler</Link>
  </nav>;
}
