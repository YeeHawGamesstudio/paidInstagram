import "server-only";

import { env } from "@/lib/config/env";
import type { BillingProviderAdapter } from "@/lib/billing/provider";
import { mockBillingProvider } from "@/lib/billing/providers/mock-provider";
import { unconfiguredBillingProvider } from "@/lib/billing/providers/unconfigured-provider";

const providers = new Map<string, BillingProviderAdapter>([
  [mockBillingProvider.name, mockBillingProvider],
]);

export function getBillingProvider(providerName = env.billingProvider): BillingProviderAdapter {
  if (!providerName) {
    return unconfiguredBillingProvider;
  }

  return providers.get(providerName) ?? unconfiguredBillingProvider;
}
