import { canonicalJson, detectConflicts, isSkippableDuplicate } from "./identity";
import { EMPTY_STATE, evaluate, targetReached } from "./invariants";
import { orderDeliveries, resolveLegacyAmount } from "./repair";
import type {
  DeliveryRecord,
  IncidentBundle,
  ReplayResult,
  ReplayState,
  RepairConfig,
  Violation,
} from "./types";

/** Non-cryptographic 53-bit fingerprint (cyrb53). For identity of inputs in this tool only. */
function fingerprint(text: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const n = 4294967296 * (2097151 & h2) + (h1 >>> 0);
  return "cyrb53-" + n.toString(16).padStart(14, "0");
}

function firstDivergence(violations: readonly Violation[]): Violation | null {
  let best: Violation | null = null;
  for (const v of violations) {
    if (best === null || v.deliveryIndex < best.deliveryIndex) best = v;
  }
  return best;
}

/**
 * Pure, deterministic replay of a VALIDATED bundle (see schema.ts). Never mutates input,
 * never throws for business data, makes no network calls. A pass means only that this
 * synthetic replay passed.
 */
export function replay(bundle: IncidentBundle, config: RepairConfig): ReplayResult {
  const cfg: RepairConfig = {
    normalizeV2Amount: config.normalizeV2Amount,
    deduplicateDeliveries: config.deduplicateDeliveries,
    causalCheckoutOrder: config.causalCheckoutOrder,
  };
  const inputHash = fingerprint(canonicalJson(bundle));
  const conflicts = detectConflicts(bundle.events);

  if (conflicts.length > 0) {
    const conflictIds = new Set(conflicts.map((g) => g.eventId));
    const deliveries: DeliveryRecord[] = [];
    const violations: Violation[] = [];
    for (const e of orderDeliveries(bundle.events, { ...cfg, causalCheckoutOrder: false })) {
      if (!conflictIds.has(e.eventId)) continue;
      const v: Violation = {
        code: "identity_conflict",
        eventId: e.eventId,
        deliveryIndex: e.deliveryIndex,
        message: `Event ${e.eventId} was delivered with different canonical content. Replay stopped.`,
      };
      violations.push(v);
      deliveries.push({
        eventId: e.eventId,
        deliveryIndex: e.deliveryIndex,
        type: e.type,
        decision: "hard_conflict",
        before: EMPTY_STATE,
        after: EMPTY_STATE,
        violations: [v],
      });
    }
    return {
      inputHash,
      config: cfg,
      halted: true,
      conflicts,
      executionOrder: [],
      deliveries,
      violations,
      firstDivergence: firstDivergence(violations),
      finalState: EMPTY_STATE,
      targetReached: false,
      pass: false,
    };
  }

  const order = orderDeliveries(bundle.events, cfg);
  const applied = new Set<string>();
  const deliveries: DeliveryRecord[] = [];
  const ledger: Violation[] = [];
  let state: ReplayState = EMPTY_STATE;

  for (const e of order) {
    const before = state;
    if (isSkippableDuplicate(applied, e.eventId, cfg.deduplicateDeliveries)) {
      deliveries.push({
        eventId: e.eventId,
        deliveryIndex: e.deliveryIndex,
        type: e.type,
        decision: "duplicate_skipped",
        before,
        after: before,
        violations: [],
      });
      continue;
    }
    const amount = e.type === "payment.captured" ? resolveLegacyAmount(e, cfg, bundle.currency) : null;
    const result = evaluate(state, e, amount);
    state = result.next;
    if (!result.rejected) applied.add(e.eventId); // applied-only idempotency key
    ledger.push(...result.violations);
    deliveries.push({
      eventId: e.eventId,
      deliveryIndex: e.deliveryIndex,
      type: e.type,
      decision: result.rejected ? "rejected" : "applied",
      before,
      after: state,
      violations: result.violations,
    });
  }

  const reached = targetReached(state);
  return {
    inputHash,
    config: cfg,
    halted: false,
    conflicts: [],
    executionOrder: order.map((e) => ({ eventId: e.eventId, deliveryIndex: e.deliveryIndex })),
    deliveries,
    violations: ledger,
    firstDivergence: firstDivergence(ledger),
    finalState: state,
    targetReached: reached,
    pass: reached && ledger.length === 0,
  };
}
