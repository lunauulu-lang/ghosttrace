# Regression / test matrix (written before the engine; G000–G111 are now covered by `tests/engine/golden.test.ts`, PASS locally)

Only real test execution with command, exit code and commit SHA counts as PASS.
Scenario source: `fixtures/haunted-checkout.json`; exact expected behavior: `.kiro/specs/ghosttrace/design.md` Golden outcomes.

## Golden replay matrix: all three binary repairs

`M` = normalize V2 amount; `O` = causal ordering; `D` = applied-only dedup.
`captured` is synthetic USD minor units, not a real transaction.
`pass` requires target state **and no historical violations**.

| ID | M | O | D | captured | fulfilled | required violation codes | pass |
|---|---:|---:|---:|---:|---|---|---|
| G000 | 0 | 0 | 0 | 0 | false | schema_drift; order_violation; fulfillment_without_capture | false |
| G001 | 0 | 0 | 1 | 0 | false | schema_drift; order_violation; fulfillment_without_capture | false |
| G010 | 0 | 1 | 0 | 0 | false | schema_drift; fulfillment_without_capture | false |
| G011 | 0 | 1 | 1 | 0 | false | schema_drift; fulfillment_without_capture | false |
| G100 | 1 | 0 | 0 | 4900 | true | order_violation (d1 rejected but retry d3 works) | false |
| G101 | 1 | 0 | 1 | 4900 | true | order_violation (d1 rejected and does not consume key) | false |
| G110 | 1 | 1 | 0 | 9800 | false | capture_over_total; fulfillment_amount_mismatch | false |
| G111 | 1 | 1 | 1 | 4900 | true | none | true |

## Other mandatory cases

| ID | Input or action | Required result |
|---|---|---|
| F01 | Open site unauthenticated | Synthetic demo accessible, no credentials |
| F02 | Baseline fixture G000 | Exact failure codes, first divergent delivery and trace visible |
| F07 | Same ID + identical canonical event fields + different deliveryIndex | With D=1 skip after successful apply; no mutation of input |
| F07b | First attempt rejected; retry identical ID later becomes applicable | Retry applies (D=1), initial order violation still logged |
| F08 | Same ID + changed canonical content including unknown payload field | Hard conflict regardless of D |
| F09 | Malformed JSON / over 1MiB / 501 events | Friendly rejection, no outbound requests |
| F10 | Float, negative or string money, invalid currency | Rejected as invalid money, never coerced |
| F11 | Unknown type/version / timestamp / reused deliveryIndex | Rejected before replay |
| F12 | Nested token/secret/cookie/authorization/api_key/card_number | All scrubbed in preview and downloaded outputs |
| F13 | Export passing G111 with repair preset; reimport | Restores repair settings and exact passing target; no unsanitized fields |
| F14 | Seeded property-based delivery permutations with M=O=D=1 | Identical final state and zero violations for valid permutations, original input untouched |
| F15 | Repeat replay with identical input and configuration | Identical decisions, snapshots and input hash |
| F16 | Keyboard navigation / reduced motion / responsive | UI functions without mouse and avoids forced motion |
| F17 | `npm test`, `npm run typecheck`, `npm run build` | Real exit code 0 tied to SHA |
| F18 | Browser E2E | Assert G000 fails -> G110 overcaptures -> G111 passes -> export/reimport passes |
| F19 | Public release after owner approval | Judge URL works in clean browser |
| F20 | Contest repo after approved publication | Public GitHub, OSI license, root `/.kiro`, reproducible instructions |
| F21 | Deeply nested JSON (depth >32) | Reject cleanly before recursive parser/redactor |
| F22 | Nested `x-signature`, `signature`, `Webhook-Signature` in export | Case-insensitive substring-sensitive signature fields scrubbed |
| F23 | Ordering repaired using event type dependency | `occurredAt` does not determine execution order; original deliveryIndex still visible |
| F24 | Baseline/repair diff with changed execution order | Pair by (eventId, deliveryIndex), first divergent original delivery identified |

## Definition of done

Record each test as PASS/FAIL/NOT RUN based on evidence. No claim that the staging fixture or this matrix was executed until the engine exists. CI must test the **GhostTrace contest repository**, not only the AI Software Factory root. Keep logs/screenshots tied to the exact commit SHA.
