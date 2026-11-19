# GhostTrace export / import — Design
Implements `requirements.md` in this folder. Engine untouched. Pure logic lives in `src/lib/` (no I/O); browser APIs (Blob, file input) live only in the component.

## Modules
| File | Role |
|---|---|
| `src/lib/exportBundle.ts` | `buildExportFile(bundle, config)`, `serializeExport(file)`, `buildRepairSpec(bundle, config)`. Pure, deterministic. |
| `src/lib/importBundle.ts` | `parseImportText(text)` returns `{ ok: true, bundle, config }` or `{ ok: false, errors }`. Never throws. |
| `src/components/ExportPanel.tsx` | Preview toggle, two download buttons, file input, error list, status line. Owns Blob and FileReader use. |
| `src/components/ReplayWorkbench.tsx` | Holds `bundle` as state (initial prop) next to `config`; passes both to the panel; applies an import. |

## Export file format
```json
{
  "format": "ghosttrace-export",
  "formatVersion": 1,
  "preset": { "config": { "normalizeV2Amount": true, "deduplicateDeliveries": true, "causalCheckoutOrder": true } },
  "bundle": { "schemaVersion": 1, "incidentId": "...", "title": "...", "currency": "USD", "events": [] }
}
```
`serializeExport` runs `redact(file)` on the whole object, then `JSON.stringify(_, null, 2) + "\n"`. Redaction keeps the config keys because none contains a secret fragment. The preview shows the same string that is downloaded.

## Repair spec (Markdown)
Built from `replay(bundle, ALL_OFF)` and `replay(bundle, config)` only. Sections: `# Kiro repair spec: <title>`, `## Failing invariants (all repairs off)` (table of code, delivery, message), `## Repairs applied` (checked list of the three repairs), `## Fixed`, `## Still failing`, `## Result` (PASS or FAIL, final state in USD), and a note that amounts are simulated. No payload values are printed. Only the title, event IDs, violation codes and engine messages appear; tests check that secret sentinels placed in payloads never show up.

## Import pipeline (`parseImportText`)
1. Size: `text.length > MAX_BYTES` or UTF-8 bytes > MAX_BYTES gives `too_large`. The component also checks `file.size` before reading.
2. Depth: `measureTextDepth(text) > MAX_DEPTH` gives `too_deep` (no parse).
3. `JSON.parse` in try/catch gives `malformed_json`.
4. Wrapper checks: object, `format`, `formatVersion`, `preset.config` (exactly three boolean keys). Collect every error.
5. `validateBundle(parsed.bundle)`; errors get path prefix `bundle.`. Errors from steps 4 and 5 are merged so the user sees them all at once.
6. Success returns a deep clone (`validateBundle` already clones).
Constants `MAX_BYTES`, `MAX_DEPTH`, `measureTextDepth`, `validateBundle` are imported from `src/engine/schema.ts`; none is changed.

## UI flow
- "Export" section in the Incident panel: button "Preview export" (`aria-expanded`). When open: two `<pre tabindex="0">` blocks with `aria-label` ("Export JSON preview", "Repair spec preview"), buttons "Download export JSON" and "Download Kiro repair spec".
- Download: `new Blob([text], { type })`, `URL.createObjectURL`, temporary `<a download>` click, `URL.revokeObjectURL`. File names: `ghosttrace-export.json`, `ghosttrace-repair-spec.md`.
- Import: `<label>Import export file <input type="file" accept="application/json,.json"></label>`. On change: reject when `file.size > MAX_BYTES`; otherwise read with `FileReader`, call `parseImportText`, then either apply or show errors in `<ul role="alert">`. The input value is cleared so the same file can be chosen again.
- Status: `<p role="status">` is already used for the verdict, so the import message uses `aria-live="polite"` on a `<p data-testid="import-status">` and not `role="status"` (existing UI test 1 uses `getByRole("status")` and needs a single match).
- Narrow screens: `pre { overflow: auto; max-width: 100% }`, buttons wrap, the panel keeps `min-width: 0`.

## Security
- No `fetch`, XHR, localStorage or cookies. Imported text is only parsed as data; never evaluated, never placed in `innerHTML`.
- Redaction depth limit 32 (same counting as the schema). Prototype keys stay plain data (`defineProperty` in `redact`).
- Imported secrets: an import with secret-key fields is accepted as data, and the next export redacts them again.

## Test plan
Vitest, files under `tests/lib/` and `tests/ui/`:
- export: format fields, preset present, config round trip, deep nested `token`, `api_key`, `X-Signature`, `Webhook-Signature`, `cookie`, `authorization`, `card_number` sentinels absent from JSON and spec, depth 33 data does not crash, input not mutated, deterministic output, spec contents for G000, G110, G111.
- import: oversize, malformed, depth 33, wrong format, wrong version, bad preset (missing, string, extra key), bundle errors (float money, negative, string, bad currency, unknown type, reused deliveryIndex, 501 events) with `bundle.` prefix and all errors listed, never throws on junk (fast-check strings, seed 20261117).
- round trip: G111 export then import gives identical bundle, config, `inputHash`, PASS; property test over the eight configs.
- UI (jsdom): preview shows text, downloads hidden until preview, import of a valid file restores G111 and PASS, bad file shows alert and leaves state, `fetch` never called.
Playwright (CI only), folder `e2e/`: full story, keyboard-only, 375 px viewport.

## CI
Job `e2e` `needs: verify`: checkout, setup-node 22, `npm ci`, `npx playwright install --with-deps chromium`, `npm run build`, run `npx playwright test` (the config starts `vite preview` on port 4173), upload `playwright-report/` with `actions/upload-artifact@v4` (`if: always()`).
