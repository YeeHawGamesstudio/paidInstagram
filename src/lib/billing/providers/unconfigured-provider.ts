import "server-only";

import type {
  BillingProviderAdapter,
  BillingProviderSubscriptionCancelInput,
  BillingProviderSubscriptionCancelResult,
  BillingProviderMessageUnlockPurchaseInput,
  BillingProviderPurchaseResult,
  BillingProviderSubscriptionPurchaseInput,
  BillingReconciliationInput,
  BillingReconciliationResult,
  BillingWebhookEvent,
} from "@/lib/billing/provider";
import { BillingConfigurationError } from "@/lib/billing/errors";

function throwConfigurationError(): never {
  throw new BillingConfigurationError(
    "Billing is not configured for this environment. Connect a real provider adapter before enabling live purchases.",
  );
}

export class UnconfiguredBillingProvider implements BillingProviderAdapter {
  readonly name = "unconfigured";
  readonly supportsWebhooks = false;
  readonly supportsReconciliation = false;

  isConfigured() {
    return false;
  }

  async createSubscriptionPurchase(
    _input: BillingProviderSubscriptionPurchaseInput,
  ): Promise<BillingProviderPurchaseResult> {
    return throwConfigurationError();
  }

  async cancelSubscription(
    _input: BillingProviderSubscriptionCancelInput,
  ): Promise<BillingProviderSubscriptionCancelResult> {
    return throwConfigurationError();
  }

  async createMessageUnlockPurchase(
    _input: BillingProviderMessageUnlockPurchaseInput,
  ): Promise<BillingProviderPurchaseResult> {
    return throwConfigurationError();
  }

  async parseWebhook(_request: Request): Promise<BillingWebhookEvent> {
    return throwConfigurationError();
  }

  async reconcileTransaction(
    _input: BillingReconciliationInput,
  ): Promise<BillingReconciliationResult | null> {
    return throwConfigurationError();
  }
}

export const unconfiguredBillingProvider = new UnconfiguredBillingProvider();
