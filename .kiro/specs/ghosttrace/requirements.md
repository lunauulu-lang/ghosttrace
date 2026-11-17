# Requirements — GhostTrace MVP (planning draft, 2026-11-16)

## User story and demo
As a solo SaaS engineer, I want to replay a broken webhook delivery sequence safely, see where state diverges, apply explicit mapping/deduplication/ordering repairs and export a reproducible regression test, so I can investigate without touching production systems.

### R1: Guest synthetic incident
WHEN a guest opens the application, THE SYSTEM SHALL provide a named synthetic "The Haunted Checkout" incident without login or API keys.
WHEN replay runs with all repairs off, THE SYSTEM SHALL show at least one reproducible failure, the specific event ID, the exact invariant and a state timeline.
WHEN all supported repairs are enabled, THE SYSTEM SHALL replay the same immutable input and show an explicitly defined passing target state.

### R2: Import contract
WHEN a JSON file <= 1 MiB containing <= 500 events is imported, THE SYSTEM SHALL validate its shape and types before replay.
WHEN a file is larger, malformed, has unknown event version/type, an invalid ISO timestamp or invalid money representation, THE SYSTEM SHALL reject it with a readable error and shall not execute any content.
THE SYSTEM SHALL make no external calls as a result of importing a file.

### R3: Event identity and order
WHEN repeated deliveries share an ID and semantically identical canonical event content, THE SYSTEM SHALL mark a later delivery as `duplicate_skipped` ONLY if an earlier delivery with that event ID was successfully applied and deduplication is enabled. Rejected deliveries SHALL NOT reserve the idempotency key; a later valid retry may apply it. When deduplication is disabled, later successful duplicate deliveries SHALL attempt to apply again and surface invariant failures.
WHEN repeated deliveries share an ID but differ in canonical content, THE SYSTEM SHALL stop replay with an explicit conflict regardless of repair settings.
WHEN delivery order violates the declared synthetic checkout dependencies, THE SYSTEM SHALL report the first divergence and retain it in the run's failure ledger even if a later retry leads to the target final state. WHEN ordering repair is enabled, it SHALL use the documented deterministic checkout-specific order (type dependency, then deliveryIndex), not occurredAt. The deliveryIndex MUST be unique in a validated bundle.

### R4: Schema and money
WHEN a v2 payment event has `amount_minor` while the sample legacy consumer expects `amount_cents`, THE SYSTEM SHALL flag schema drift unless the explicit v2 mapping is enabled.
ALL amounts SHALL be integer minor currency units, not floating point values.
The repaired fixture SHALL yield exactly one capture of 4900 USD minor units and final fulfilled state for checkout demo-001.

### R5: Observability and compare
THE SYSTEM SHALL show received delivery order, processed order, duplicate/conflict decisions, invariant failures and before/after state snapshots.
THE SYSTEM SHALL highlight the first divergent event, not merely a green/red status. Comparisons SHALL match deliveries by (eventId, deliveryIndex), not by their re-sorted position. The UI SHALL demonstrate all eight combinations of three repair toggles and distinguish successful final state from a clean violation-free replay.
A passing replay SHALL NOT claim that any third-party production system was fixed.

### R6: Export and privacy
WHEN the user exports, THE SYSTEM SHALL show a preview and provide a sanitized regression fixture and a Kiro repair spec referencing relevant event IDs and invariant checks.
THE SYSTEM SHALL exclude credentials/tokens and redact values in fields named authorization, token, secret, password, cookie, api_key, card_number (case-insensitive), and any key containing `signature` (case-insensitive). Nested object depth SHALL be bounded to 32 and overdeep JSON rejected before recursive processing.
THE SYSTEM SHALL never send uploaded events to a network endpoint in guest mode.

### R7: UX and accessibility
THE SYSTEM SHALL render in English with readable errors and intentional dark styling.
All primary controls SHALL be keyboard-operable and labelable for screen readers; reduced-motion preferences SHALL be respected.

### R8: QA and release
BEFORE presenting the demo as working, THE SYSTEM SHALL pass unit tests, seeded property-based tests including replay invariance under delivery permutations with all repairs enabled, TypeScript check, a production build and browser E2E of broken -> repaired -> exported -> reimported. The exported artifact SHALL preserve or explicitly restore the selected repairs so a reimported passing run is reproducible.
BEFORE submission, THE REPOSITORY SHALL be public, contain an OSI license at root, `/.kiro` at root and full reproduction instructions; a working judge URL and public YouTube demo < 3 minutes are required.
Evidence SHALL distinguish actual Kiro work from ChatGPT-created planning docs.

### R9: Portable replay engine (optional after web MVP)
The deterministic replay core SHOULD expose a read-only CLI and, only if the core and browser demo are verified, MAY expose a local stdio MCP tool. No external webhook dispatch, production payment access, or implicit shell execution. These optional integrations MUST NOT delay the core release.

## Explicit non-goals for MVP
Production webhook replay; real Stripe/Paddle connections; outbound deliveries; paid billing; background queues; universal causal inference; multi-tenant persistence; revenue claims. Optional Supabase work starts only after R1-R8 guest path works.
