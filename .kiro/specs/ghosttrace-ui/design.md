# GhostTrace UI v1 — Design

Extends `.kiro/specs/ghosttrace/design.md` ("UI design" and "Testable end-to-end flow"); does not change it.

## Component tree

```
main.tsx
└── App                      load + validate fixture; error state on failure
    └── ReplayWorkbench      owns state; runs replay + compareReplays
        ├── (left)   incident title, synthetic badge, RepairConfig checkboxes, preset buttons
        ├── (middle) IncidentTimeline   rows in original deliveryIndex order
        └── (right)  StateInspector     verdict, final state, ledger, fingerprint, selected delivery
```

## State model

The only state, both in `ReplayWorkbench`:
1. `config: RepairConfig` (starts all false).
2. `selected: number | null` (a `deliveryIndex`).

Derived with `useMemo`, never stored:
- `baseline = replay(bundle, ALL_OFF)` (computed once per bundle)
- `current = replay(bundle, config)`
- `diff = compareReplays(baseline, current)`

Presets are plain functions that call `setConfig` with a fixed RepairConfig. The preset buttons do not keep a "current preset" state.

## Data flow

fixture JSON (static import) → `validateBundle` → `IncidentBundle` (read only) → `replay` ×2 → `compareReplays` → props to `IncidentTimeline` and `StateInspector`. Components are pure functions of props. The engine is never called with a mutated bundle. No effects, no fetch, no storage.

## Display rules

- Amounts: `(minor / 100).toFixed(2)` prefixed with `$` (USD only, per schema).
- Timeline row key: `deliveryIndex`. Execution position comes from `executionOrder.findIndex` by `(eventId, deliveryIndex)`; "executed #N" appears when N differs from the row's 1-based position.
- First divergence row: `diff.firstDivergence?.deliveryIndex`.
- Over-capture note: shown when `capturedMinor > totalMinor` for any checkout.
- Halted replay (hard conflict): show a notice; the fixture does not trigger it but the UI must not crash.

## Accessibility

- Native `<input type="checkbox">` with `<label>`, native `<button>`; no custom widgets.
- Timeline rows are `<button>` elements inside a `<ul>`; `aria-pressed` marks the selected row. Tab and Enter/Space work with no extra key code.
- Verdict in `role="status"` with `aria-live="polite"`.
- Landmarks: `<header>`, `<main>`, three `<section aria-labelledby>`.
- Text labels carry meaning ("First divergence", "FAIL", decision words); colour only reinforces.
- Focus ring: `:focus-visible` 3 px outline on every control.

## Styling

One file, `src/styles.css`. CSS variables for a dark Halloween palette (near-black background, pumpkin orange `#ff8c1a`, ghost white `#f4f1ea`); text/background pairs chosen for WCAG AA (≥ 4.5:1). CSS grid with three columns at `min-width: 1024px`, single column below. `@media (prefers-reduced-motion: reduce)` sets `animation: none; transition: none` on everything. No external fonts, no images.

## Testing

jsdom + `@testing-library/react` in `tests/ui/workbench.test.tsx` (per-file `@vitest-environment jsdom`). Golden values come from `docs/TEST_MATRIX.md`. Vitest `include` widens to `tests/**/*.test.{ts,tsx}`. Real-browser checks (responsive, focus, reduced motion) are Slice 3.
