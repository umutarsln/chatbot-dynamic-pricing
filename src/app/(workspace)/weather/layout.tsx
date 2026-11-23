import type { ReactNode } from "react";
import { WeatherNavigation } from "@/components/weather/weather-navigation";

export default function WeatherLayout({ children }: { children: ReactNode }) {
  return <><WeatherNavigation />{children}</>;
}
