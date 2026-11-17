# Technical design — GhostTrace MVP (planning draft)

## Deployment shape
```text
Vite + React guest UI (static SPA)
  -> client-only import parser + validator [file size/count/type checks]
  -> pure TypeScript replay engine
      -> deterministic timeline and invariants
      -> optional explicit repair config
  -> before/after compare UI
  -> privacy-safe fixture + Kiro spec export
```
No database, external AI call or webhook receiver is needed for the first judged demo. Supabase auth/RLS/persistence can be a later private-incident feature after guest E2E is proven.

## Project files to implement with Kiro (not implemented yet)
- src/engine/schema.ts: Bundle/Event types, safe validation and import.
- src/engine/identity.ts: canonical same-ID matching, conflicts and idempotency.
- src/engine/replay.ts: immutable deterministic simulation and event traces.
- src/engine/repair.ts: explicit schema/dedup/order configuration.
- src/engine/invariants.ts: event-by-event invariant checks and pass/fail.
- src/lib/redact.ts: bounded recursive privacy scrubbing and export.
- src/components/IncidentTimeline.tsx: order, first divergence and event details.
- src/components/ReplayWorkbench.tsx: scenario, toggle controls, before/after.
- src/components/ExportPanel.tsx: client-side downloadable regression outputs.
- src/App.tsx: working public guest demo without auth.
- tests/: unit, invariant and regression cases; e2e/: browser workflow.
Only these feature paths belong to this new contest app; do not transplant unrelated factory code.

## Contract
```ts
type EventType = "checkout.created" | "payment.captured" | "fulfillment.requested";
type IncidentEvent = {
  eventId: string; deliveryIndex: number; occurredAt: string;
  type: EventType; version: 1 | 2; checkoutId: string;
  payload: Record<string, unknown>;
};
type IncidentBundle = {
  schemaVersion: 1; incidentId: string; title: string; currency: "USD";
  events: IncidentEvent[];
};
type RepairConfig = {
  normalizeV2Amount: boolean; deduplicateDeliveries: boolean; causalCheckoutOrder: boolean;
};
```
The fixture is local synthetic data. Do not imply this parser is compatible with any real payment provider.

## Replay semantics (document before coding)
1. Preserve the original input and deliveryIndex; create an immutable working copy.
2. Validate *all* events: unknown keys are allowed only as inert data, prohibited executable behavior is impossible by design.
3. Check all repeated eventIds for canonical identity conflicts BEFORE execution. Canonical identity uses stable sorted-key JSON for all fields except deliveryIndex; unknown payload fields participate, so even a changed extra field is a conflict (explicitly disclose this strict policy). A same-ID/different-canonical-content conflict is fatal independent of repairs. Same-ID/same-canonical-content repeated deliveries stay visible on the timeline.
4. Validate deliveryIndex as unique across the bundle. Without ordering repair, process in ascending deliveryIndex. With repair, apply checkout-specific causality order checkout.created -> payment.captured -> fulfillment.requested and stable tie-break by deliveryIndex; expose the reordering. occurredAt is only informational and is NOT used as the ordering key. Never claim general causal inference.
5. Without schema repair, legacy payment consumer reads amount_cents; the v2 fixture only has amount_minor, so an explicit schema error is recorded. With repair, map amount_minor -> amount_cents after integer/currency validation.
6. **Correct idempotency semantics:** a key is recorded as successfully applied ONLY after its delivery changes state successfully. A rejected delivery (missing checkout, unknown amount, etc.) does NOT reserve the key. When dedup repair is ON, skip a repeated same-ID delivery as `duplicate_skipped` only if an earlier one was applied; otherwise the retry can apply normally. When dedup repair is OFF, repeated valid captures may be applied twice; show the diagnostic simulated state `captured=9800` and capture-over-total violation, not real payment movement.
7. Every delivery gets a decision (`applied`, `rejected`, `duplicate_skipped`, or `hard_conflict`), before/after snapshots and zero or more violations. Rejections leave state unchanged but retain violations in the run ledger; an over-total capture can appear as an invalid *simulated* state to show the failure. An eventual correct final state does NOT erase earlier violations. `pass` requires the exact target state AND zero recorded violations; never throw unhandled errors.
8. Invariants: checkout must exist before payment; cumulative capture <= total_minor; fulfillment requires capture == total_minor; no unknown amount may be coerced to zero. Target: one checkout demo-001, total=4900, captured=4900, fulfilled=true, pass=true.
9. Compare baseline and repaired against exactly the same immutable input hash. Match records by `(eventId, deliveryIndex)`; compare decision, before/after snapshots and violation codes, reporting the first divergence in original delivery order even when execution order changes. Do not report "fixed in production".

## Golden outcomes: all 8 repair combinations

`M`=normalizeV2Amount, `O`=causalCheckoutOrder, `D`=deduplicateDeliveries. `d1` payment (before checkout), `d2` checkout, `d3` retry of d1, `d4` fulfillment. `fulfilled` is a final-state boolean; `pass` also requires no historical violations.

| M | O | D | captured minor USD | fulfilled | required violations | pass |
|---|---|---|---:|---|---|---|
| 0 | 0 | 0 | 0 | false | schema_drift, order_violation, fulfillment_without_capture | false |
| 0 | 0 | 1 | 0 | false | schema_drift, order_violation, fulfillment_without_capture | false |
| 1 | 0 | 0 | 4900 | true | order_violation on d1 | false |
| 1 | 0 | 1 | 4900 | true | order_violation on d1; rejected d1 must not reserve key | false |
| 0 | 1 | 0 | 0 | false | schema_drift, fulfillment_without_capture | false |
| 0 | 1 | 1 | 0 | false | schema_drift, fulfillment_without_capture | false |
| 1 | 1 | 0 | 9800 | false | capture_over_total, fulfillment_amount_mismatch | false |
| 1 | 1 | 1 | 4900 | true | none | true |

This is the mandatory scenario contract; emitted violation codes should be these names, with the exact count/events established by unit tests. The 9800 figure is a deliberate invalid *simulation* and never signifies a real charge.

## Data safety
- Parse client-side only; no network for imported fixture. Max file 1,048,576 bytes; max events 500; enforce maximum nested JSON depth 32 prior to recursive traversal; reject overdeep bundles. Enforce per-event size/count bounds after parsing.
- Never eval imported strings; do not instantiate arbitrary user-specified URLs or access private paths.
- Redaction is recursive/case-insensitive on sensitive keys, including nested objects and arrays; redact keys containing `signature`. Use the same bounded-depth checks on every export path. Export a sanitized fixture with a validated repair preset (or matching sidecar config) so importing it reproduces the same passing run; optional executable regression-test export is later work.
- Guest data is transient in memory; no localStorage or cookies are required for app state.
- Optional later Supabase: owner-scoped rows, RLS policy tests with 2 users, private by default; not a release prerequisite.
- External links/deploy and all paid actions require owner authorization.

## UI design
Three-column desktop workbench: incident selection + repair toggles, delivery timeline, state/invariant inspector. Mobile stacks panels. Strong focus indicators, no flashing animations, WCAG-conscious contrast, empty/loading/error states. A compact "Original / Repaired" switch and a visible synthetic-data badge prevent confusion.

## Testable end-to-end flow
Load fixture -> broken replay reveals out-of-order event and schema drift -> enable mapping+ordering WITHOUT dedup to show simulated over-capture of 9800 -> enable dedup -> capture 4900 once, fulfilled, no invariant failures -> preview redacted export -> download JSON plus repair preset/spec -> reload export, reproduce passing result. Tests must cover each of the 8 golden combinations.

## Optional Frankenstein extension (not on critical path)
After the core, UI and export tests pass, reuse the SAME pure engine through a read-only CLI and optionally a local stdio MCP interface, with no network or production payment integrations. Do not invent a working MCP integration; record an actual tool call only when tested. If the UI or CI is not working by November 28, omit MCP instead of weakening core acceptance.

## Unknowns
- Kiro integration behavior on actual installed Crew runtime is untested.
- Package installation, Vercel deploy, browser E2E and Supabase access are untested.
- Commercial uniqueness, potential customers and pricing are hypotheses.
