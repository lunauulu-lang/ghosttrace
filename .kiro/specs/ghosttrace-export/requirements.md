# GhostTrace export / import — Requirements
Scope: client-side sanitized export of the current incident and repair settings, local-file import, a round-trip guarantee, and a browser E2E that runs in CI only. Covers T2, T6, T7, T8 of `.kiro/specs/ghosttrace/tasks.md` and TEST_MATRIX F09–F13, F18, F21, F22. The engine (`src/engine/**`) is not changed. All data is synthetic; a PASS means only that this synthetic replay passed.

## Terms
- Bundle: an `IncidentBundle` (schemaVersion 1).
- Preset: the current `RepairConfig` (three booleans).
- Export file: one JSON file holding the redacted bundle and the preset.
- Repair spec: a short Markdown document ("Kiro repair spec").
- Secret key: any key matched by `isSensitiveKey` in `src/lib/redact.ts`, case-insensitive, `-` and `_` ignored (token, secret, cookie, authorization, apikey, cardnumber, signature).

## R1 Export content (F12, F13, F22)
User story: As an engineer, I want to export the incident and my repair settings, so that I can share a reproducible case without leaking secrets.
- WHEN the user requests an export, THE SYSTEM SHALL build the export file from the current bundle passed through `redact` and the current RepairConfig.
- THE SYSTEM SHALL write the export file with `format: "ghosttrace-export"`, `formatVersion: 1`, `bundle` and `preset: { config }`.
- THE SYSTEM SHALL pass the whole export file through `redact` before serializing it.
- THE SYSTEM SHALL ensure that no value stored under a secret key at any depth (for example nested `token`, `api_key`, `X-Signature`, `Webhook-Signature`) appears in the export file, the preview or the repair spec.
- THE SYSTEM SHALL serialize the export file as JSON with two-space indentation and a trailing newline.

## R2 Repair spec (F13)
User story: As an engineer, I want a short written spec of what broke and what fixed it, so that I can hand it to Kiro or a teammate.
- WHEN the user requests an export, THE SYSTEM SHALL produce a Markdown repair spec containing the incident title, the invariants that failed with all repairs off (violation code, original delivery index, message), the repairs currently enabled, and the result (PASS or FAIL) of the current configuration.
- THE SYSTEM SHALL list under "Fixed" each baseline violation code that the current replay no longer records.
- IF the current configuration still fails, THEN THE SYSTEM SHALL list the remaining violation codes under "Still failing".
- THE SYSTEM SHALL state that all amounts are simulated and no real payment occurred.
- THE SYSTEM SHALL NOT include payload values in the repair spec.

## R3 Preview before download (F12)
- WHEN the user presses "Preview export", THE SYSTEM SHALL show the exact export JSON text and the repair spec text on the page.
- THE SYSTEM SHALL offer "Download export JSON" and "Download Kiro repair spec" only while the preview is shown.
- WHEN the user presses a download button, THE SYSTEM SHALL create a Blob in the browser and trigger a download of exactly the previewed text.
- THE SYSTEM SHALL NOT send export data over the network.
- WHEN the bundle or RepairConfig changes, THE SYSTEM SHALL refresh the preview so it never shows stale text.

## R4 Import limits (F09, F11, F21, T2)
User story: As an engineer, I want a hostile or broken file rejected clearly, so that the app stays safe.
- THE SYSTEM SHALL accept an export file only through a local `<input type="file">`.
- IF the file is larger than 1 MiB (1,048,576 bytes), THEN THE SYSTEM SHALL reject it without reading its content.
- IF the content is not valid JSON, THEN THE SYSTEM SHALL reject it with code `malformed_json`.
- IF the JSON nesting depth is greater than 32, THEN THE SYSTEM SHALL reject it with code `too_deep` before parsing.
- THE SYSTEM SHALL NOT make any network request while importing.

## R5 Import validation (F09, F10, F11, T2)
- IF `format` is not `"ghosttrace-export"` or `formatVersion` is not 1, THEN THE SYSTEM SHALL reject the file with a specific error.
- IF `preset.config` is missing, has a non-boolean value for any of `normalizeV2Amount`, `deduplicateDeliveries`, `causalCheckoutOrder`, or has any other key, THEN THE SYSTEM SHALL reject the file and list each problem.
- THE SYSTEM SHALL validate `bundle` with `validateBundle` (events limit, money, currency, timestamps, types, versions, reused deliveryIndex) and prefix each error path with `bundle.`.
- IF any error exists, THEN THE SYSTEM SHALL show every error (path and message) in a list with `role="alert"` and SHALL keep the current workbench state unchanged.
- THE SYSTEM SHALL NOT throw for any input text.

## R6 Import restore (F13)
- WHEN a file passes all checks, THE SYSTEM SHALL replace the active bundle and RepairConfig with the imported values, clear the selected delivery, replay, and show a status message "Imported <title>".
- THE SYSTEM SHALL NOT mutate the parsed input.

## R7 Round trip (F13)
- WHEN the user exports at G111 and imports that file, THE SYSTEM SHALL show PASS, the same RepairConfig (all three repairs on) and the same input fingerprint as before the export.
- FOR ALL bundles without secret keys and all three-boolean configs, THE SYSTEM SHALL satisfy `import(export(bundle, config))` equals `(bundle, config)`.

## R8 Browser E2E, CI only (F18, T7, T8)
- THE SYSTEM SHALL have a Playwright chromium test that loads the app, sees G000 FAIL, presses "G110 Over-capture" and sees `$98.00` with the simulated-state label and FAIL, presses "G111 Repaired" and sees PASS, exports, reimports the downloaded file and sees PASS with the same fingerprint.
- THE SYSTEM SHALL have a Playwright test that reaches G111 PASS and the export preview using only the keyboard (Tab, Enter, Space).
- THE SYSTEM SHALL have a Playwright test at a 375 px wide viewport asserting that the page does not scroll horizontally and the main controls are visible.
- THE SYSTEM SHALL run Playwright only in the CI job `e2e`, after job `verify`, and never on the developer laptop.
- THE SYSTEM SHALL keep Vitest from collecting `e2e/`.
- THE SYSTEM SHALL upload the Playwright report as a CI artifact.

## Out of scope
Deploy, public release, MCP, Supabase, regression-test export, multi-incident library.
