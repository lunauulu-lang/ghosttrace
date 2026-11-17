import type { AmountResolution } from "./repair";
import type { CheckoutState, IncidentEvent, ReplayState, Violation, ViolationCode } from "./types";

export const EMPTY_STATE: ReplayState = { checkouts: [] };

/** Documented target for the synthetic Haunted Checkout scenario. */
export const TARGET = { checkoutId: "demo-001", totalMinor: 4900, capturedMinor: 4900, fulfilled: true } as const;

export function getCheckout(state: ReplayState, checkoutId: string): CheckoutState | undefined {
  return state.checkouts.find((c) => c.checkoutId === checkoutId);
}

function putCheckout(state: ReplayState, next: CheckoutState): ReplayState {
  const rest = state.checkouts.filter((c) => c.checkoutId !== next.checkoutId);
  rest.push(next);
  rest.sort((a, b) => (a.checkoutId < b.checkoutId ? -1 : a.checkoutId > b.checkoutId ? 1 : 0));
  return { checkouts: rest };
}

export function targetReached(state: ReplayState): boolean {
  if (state.checkouts.length !== 1) return false;
  const c = state.checkouts[0];
  return (
    c !== undefined &&
    c.checkoutId === TARGET.checkoutId &&
    c.totalMinor === TARGET.totalMinor &&
    c.capturedMinor === TARGET.capturedMinor &&
    c.fulfilled === TARGET.fulfilled
  );
}

export type Evaluation = {
  violations: Violation[];
  rejected: boolean;
  next: ReplayState;
};

/**
 * Event-by-event invariant checks. Pure: returns a new state, never mutates `state` or `event`.
 * Invariants: checkout exists before payment; cumulative capture <= total;
 * fulfillment requires capture == total; unknown amounts are never coerced to zero.
 * A rejected delivery leaves state unchanged. An over-total capture IS applied (invalid simulated state).
 */
export function evaluate(state: ReplayState, event: IncidentEvent, amount: AmountResolution | null): Evaluation {
  const violations: Violation[] = [];
  const flag = (code: ViolationCode, message: string) =>
    violations.push({ code, eventId: event.eventId, deliveryIndex: event.deliveryIndex, message });
  const reject = (): Evaluation => ({ violations, rejected: true, next: state });
  const existing = getCheckout(state, event.checkoutId);

  if (event.type === "checkout.created") {
    const total = event.payload.total_minor;
    if (typeof total !== "number" || !Number.isSafeInteger(total) || total <= 0) {
      flag("unknown_amount", "checkout total_minor is not a positive integer.");
      return reject();
    }
    if (existing) {
      flag("checkout_already_exists", `Checkout ${event.checkoutId} already exists.`);
      return reject();
    }
    return {
      violations,
      rejected: false,
      next: putCheckout(state, { checkoutId: event.checkoutId, totalMinor: total, capturedMinor: 0, fulfilled: false }),
    };
  }

  if (event.type === "payment.captured") {
    if (amount && !amount.ok) flag(amount.code, amount.message);
    if (!amount) flag("unknown_amount", "No amount resolution supplied.");
    if (!existing) flag("order_violation", `Payment arrived before checkout ${event.checkoutId} existed.`);
    if (violations.length > 0 || !existing || !amount || !amount.ok) return reject();
    const captured = existing.capturedMinor + amount.amountMinor;
    if (captured > existing.totalMinor) {
      flag("capture_over_total", `Simulated capture ${captured} exceeds total ${existing.totalMinor}.`);
    }
    return { violations, rejected: false, next: putCheckout(state, { ...existing, capturedMinor: captured }) };
  }

  // fulfillment.requested
  if (!existing) {
    flag("order_violation", `Fulfillment arrived before checkout ${event.checkoutId} existed.`);
    return reject();
  }
  if (existing.fulfilled) {
    flag("duplicate_fulfillment", `Checkout ${event.checkoutId} is already fulfilled.`);
    return reject();
  }
  if (existing.capturedMinor === 0) {
    flag("fulfillment_without_capture", "Fulfillment requested with no captured payment.");
    return reject();
  }
  if (existing.capturedMinor !== existing.totalMinor) {
    flag(
      "fulfillment_amount_mismatch",
      `Captured ${existing.capturedMinor} does not equal total ${existing.totalMinor}.`,
    );
    return reject();
  }
  return { violations, rejected: false, next: putCheckout(state, { ...existing, fulfilled: true }) };
}
