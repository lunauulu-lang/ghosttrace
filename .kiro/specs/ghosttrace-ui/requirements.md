# GhostTrace UI v1 — Requirements

Scope: guest replay workbench for the synthetic checkout incident. Export/import UI and browser E2E are out of scope (Slice 3). Everything the UI shows is derived from the pure engine (`replay`, `compareReplays`). A PASS means only that this synthetic replay passed.

## R1 Load the synthetic fixture
User story: As a solo SaaS engineer, I want the incident loaded without setup, so that I can start the demo immediately.
- WHEN the app starts, THE SYSTEM SHALL validate `fixtures/haunted-checkout.json` with `validateBundle` and render the workbench.
- IF validation fails, THEN THE SYSTEM SHALL show an error state listing each error path and message, and SHALL NOT render the workbench.
- THE SYSTEM SHALL require no login, secret or external service.

## R2 Repair toggles
User story: As an engineer, I want to switch each repair on and off, so that I can see what each one changes.
- THE SYSTEM SHALL show three labelled checkboxes: "Schema mapping (v2 amount)" (`normalizeV2Amount`), "Causal ordering" (`causalCheckoutOrder`), "Deduplicate applied deliveries" (`deduplicateDeliveries`).
- WHEN a checkbox changes, THE SYSTEM SHALL replay the fixture with the new RepairConfig and update every panel.
- THE SYSTEM SHALL start with all three repairs off.

## R3 Story presets
User story: As a demo viewer, I want one click to reach the key stories, so that the demo stays under three minutes.
- THE SYSTEM SHALL show three buttons: "G000 Broken", "G110 Over-capture", "G111 Repaired".
- WHEN "G000 Broken" is pressed, THE SYSTEM SHALL set all repairs off.
- WHEN "G110 Over-capture" is pressed, THE SYSTEM SHALL set schema mapping and causal ordering on, deduplication off.
- WHEN "G111 Repaired" is pressed, THE SYSTEM SHALL set all repairs on.

## R4 Timeline in original delivery order
- THE SYSTEM SHALL list one row per delivery record, ordered by original `deliveryIndex`, not execution order.
- THE SYSTEM SHALL show, per row: `d<deliveryIndex>`, event type, eventId, decision as text (applied, rejected, duplicate_skipped, hard_conflict), and violation codes.
- WHEN a delivery executed at a position different from its delivery position, THE SYSTEM SHALL show "executed #N".

## R5 First divergence
- THE SYSTEM SHALL compare the current run against a baseline run with all repairs off, using `compareReplays`.
- WHEN a divergence exists, THE SYSTEM SHALL mark the first divergent delivery row with the visible text "First divergence".
- THE SYSTEM SHALL NOT convey the marker by colour alone.

## R6 Final state and verdict
- THE SYSTEM SHALL show "PASS" or "FAIL" in an `aria-live="polite"` region, taken from `ReplayResult.pass`.
- THE SYSTEM SHALL show captured and total amounts in USD, converted from minor units, and fulfilled as yes or no.
- THE SYSTEM SHALL show the violation ledger with code, delivery and message.
- THE SYSTEM SHALL show the input hash labelled "input fingerprint, non-cryptographic".

## R7 Simulated over-capture
- WHEN captured exceeds total, THE SYSTEM SHALL show "Simulated invalid state — no real charge" next to the captured amount.
- WHEN the G110 preset is active, THE SYSTEM SHALL show captured $98.00, `capture_over_total`, and FAIL.

## R8 Synthetic-data badge
- THE SYSTEM SHALL always show the badge "Synthetic data — no real payments".

## R9 Selected delivery detail
- WHEN a timeline row is selected, THE SYSTEM SHALL show that delivery's before and after state.
- THE SYSTEM SHALL let the user select a row by mouse and by keyboard.

## R10 Keyboard-only use
- THE SYSTEM SHALL make every control reachable and operable with the keyboard alone.
- THE SYSTEM SHALL show a visible focus ring on every interactive element.
- THE SYSTEM SHALL give every checkbox and button an accessible name.

## R11 Reduced motion
- WHERE the user agent reports `prefers-reduced-motion: reduce`, THE SYSTEM SHALL disable all transitions and animations.

## R12 No network
- THE SYSTEM SHALL make zero network requests at runtime, including no fonts or CDNs.
- THE SYSTEM SHALL NOT use localStorage, cookies or analytics.

## R13 Immutability
- WHEN the user changes toggles or selection, THE SYSTEM SHALL NOT mutate the imported fixture.

## R14 Responsive layout
- WHILE the viewport is at least 1024 px wide, THE SYSTEM SHALL show three columns.
- WHILE the viewport is narrower than 1024 px, THE SYSTEM SHALL stack the panels.
- Verification of R10 keyboard flow in a real browser and R14 is deferred to Slice 3 (browser E2E).
