import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Otai | Dinamik Fiyatlandırma",
  description: "Otel doluluğu, rakip fiyatları ve dinamik fiyat önerileri için örnek gelir yönetimi dashboard.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="tr"><body>{children}</body></html>;
}
