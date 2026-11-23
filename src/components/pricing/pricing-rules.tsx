"use client";

import { Icon } from "@/components/ui/icon";
import { usePricing, money } from "./pricing-provider";

export default function PricingRules() {
  const { room } = usePricing();
  return <section className="panel rules-panel" id="rules" aria-labelledby="rules-title"><div className="panel-heading"><h2 id="rules-title">Fiyatlandırma çerçevesi</h2><Icon name="rules" /></div><p className="panel-subtitle">{room.name} için örnek sınırlar</p><dl className="pricing-rules"><div><dt>Taban fiyat</dt><dd>{money.format(room.min)}</dd></div><div><dt>Tavan fiyat</dt><dd>{money.format(room.max)}</dd></div><div><dt>Fiyat adımı</dt><dd>₺50</dd></div><div><dt>Yayınlama modu</dt><dd>Manuel inceleme</dd></div></dl><div className="demand-note"><Icon name="sparkle" size={19} /><div><strong>Hafta sonu talebi yükseliyor</strong><p>27–28 Kasım için tahmini doluluk %90 üzerinde. Artış önerilerini inceleyin.</p></div></div><p className="source-note">Bu senaryoda doluluk sabit tutulur. Fiyat değişiminin talebe etkisi modellenmez.</p></section>;
}
