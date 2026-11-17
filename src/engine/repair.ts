import type { EventType, IncidentEvent, RepairConfig } from "./types";

export const NO_REPAIRS: RepairConfig = {
  normalizeV2Amount: false,
  deduplicateDeliveries: false,
  causalCheckoutOrder: false,
};

export const ALL_REPAIRS: RepairConfig = {
  normalizeV2Amount: true,
  deduplicateDeliveries: true,
  causalCheckoutOrder: true,
};

/** Checkout-specific dependency rank. Not general causal inference. occurredAt is never used. */
const TYPE_RANK: Record<EventType, number> = {
  "checkout.created": 0,
  "payment.captured": 1,
  "fulfillment.requested": 2,
};

/** Execution order. Off: ascending deliveryIndex. On: type dependency, then deliveryIndex. Returns a new array. */
export function orderDeliveries(events: readonly IncidentEvent[], config: RepairConfig): IncidentEvent[] {
  const copy = [...events];
  if (config.causalCheckoutOrder) {
    return copy.sort((a, b) => TYPE_RANK[a.type] - TYPE_RANK[b.type] || a.deliveryIndex - b.deliveryIndex);
  }
  return copy.sort((a, b) => a.deliveryIndex - b.deliveryIndex);
}

export type AmountResolution =
  | { ok: true; amountMinor: number }
  | { ok: false; code: "schema_drift" | "unknown_amount"; message: string };

function isPositiveMinor(v: unknown): v is number {
  return typeof v === "number" && Number.isSafeInteger(v) && v > 0;
}

/**
 * The sample legacy payment consumer reads `amount_cents`.
 * With normalizeV2Amount, a v2 `amount_minor` is mapped to it after integer/currency checks.
 * An unknown amount is never coerced to zero.
 */
export function resolveLegacyAmount(
  event: IncidentEvent,
  config: RepairConfig,
  bundleCurrency: string,
): AmountResolution {
  const p = event.payload;
  if (isPositiveMinor(p.amount_cents)) return { ok: true, amountMinor: p.amount_cents };
  if (event.version === 2 && p.amount_minor !== undefined) {
    if (!config.normalizeV2Amount) {
      return {
        ok: false,
        code: "schema_drift",
        message: "v2 payment carries amount_minor but the legacy consumer reads amount_cents.",
      };
    }
    if (isPositiveMinor(p.amount_minor) && p.currency === bundleCurrency) {
      return { ok: true, amountMinor: p.amount_minor };
    }
    return { ok: false, code: "unknown_amount", message: "amount_minor is not a positive integer in the bundle currency." };
  }
  return { ok: false, code: "unknown_amount", message: "Payment has no usable amount." };
}
