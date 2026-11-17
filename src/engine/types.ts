// Engine contract. Pure data types only; no behavior. See .kiro/specs/ghosttrace/design.md.

export type EventType = "checkout.created" | "payment.captured" | "fulfillment.requested";

export type IncidentEvent = {
  eventId: string;
  deliveryIndex: number;
  occurredAt: string;
  type: EventType;
  version: 1 | 2;
  checkoutId: string;
  payload: Record<string, unknown>;
};

export type IncidentBundle = {
  schemaVersion: 1;
  incidentId: string;
  title: string;
  currency: "USD";
  events: IncidentEvent[];
};

export type RepairConfig = {
  normalizeV2Amount: boolean;
  deduplicateDeliveries: boolean;
  causalCheckoutOrder: boolean;
};

// ---- import validation ----

export type ValidationError = {
  path: string;
  code: string;
  message: string;
};

export type ParseResult =
  | { ok: true; bundle: IncidentBundle }
  | { ok: false; errors: ValidationError[] };

// ---- simulated state (synthetic; never a real payment) ----

export type CheckoutState = {
  checkoutId: string;
  totalMinor: number;
  capturedMinor: number;
  fulfilled: boolean;
};

export type ReplayState = {
  /** Sorted by checkoutId (code-unit order) for determinism. */
  checkouts: readonly CheckoutState[];
};

export type ViolationCode =
  | "schema_drift"
  | "unknown_amount"
  | "order_violation"
  | "checkout_already_exists"
  | "capture_over_total"
  | "fulfillment_without_capture"
  | "fulfillment_amount_mismatch"
  | "duplicate_fulfillment"
  | "identity_conflict";

export type Violation = {
  code: ViolationCode;
  eventId: string;
  deliveryIndex: number;
  message: string;
};

export type Decision = "applied" | "rejected" | "duplicate_skipped" | "hard_conflict";

export type DeliveryRecord = {
  eventId: string;
  deliveryIndex: number;
  type: EventType;
  decision: Decision;
  before: ReplayState;
  after: ReplayState;
  violations: readonly Violation[];
};

export type ConflictGroup = {
  eventId: string;
  /** All delivery indexes that share this eventId, ascending. */
  deliveryIndexes: readonly number[];
};

export type ReplayResult = {
  /** Non-cryptographic fingerprint of the canonical input bundle (including deliveryIndex). */
  inputHash: string;
  config: RepairConfig;
  /** True when a hard identity conflict stopped the replay before any execution. */
  halted: boolean;
  conflicts: readonly ConflictGroup[];
  /** Execution order as (eventId, deliveryIndex) pairs. Empty when halted. */
  executionOrder: readonly { eventId: string; deliveryIndex: number }[];
  /** One record per executed delivery; when halted, one per conflicting delivery. */
  deliveries: readonly DeliveryRecord[];
  /** Run-wide violation ledger. Later success never erases earlier entries. */
  violations: readonly Violation[];
  /** Violation with the lowest original deliveryIndex, or null. */
  firstDivergence: Violation | null;
  finalState: ReplayState;
  /** Final state equals the documented target (demo-001: total 4900, captured 4900, fulfilled). */
  targetReached: boolean;
  /** targetReached AND zero recorded violations AND not halted. */
  pass: boolean;
};
