export class BillingConfigurationError extends Error {
  constructor(message = "Billing provider is not configured.") {
    super(message);
    this.name = "BillingConfigurationError";
  }
}

export class BillingProcessingError extends Error {
  constructor(message = "Billing could not be processed right now.") {
    super(message);
    this.name = "BillingProcessingError";
  }
}
