import type { ReactNode } from "react";
import { PricingProvider } from "@/components/pricing/pricing-provider";
import { WorkspaceShell } from "@/components/workspace/workspace-shell";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <PricingProvider><WorkspaceShell>{children}</WorkspaceShell></PricingProvider>;
}
