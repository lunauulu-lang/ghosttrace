# GhostTrace final review (branch `slice-6`, HEAD c78aa14)

Reviewer: a Kiro session acting as a strict Kiroween judge, with no session ID. **The owner reports** selecting the `ghosttrace-reviewer` agent in the agent selector and running this review in a new chat. The reviewer wrote below that it cannot verify which agent it was, and no session ID exists, so the custom-agent run is NOT VERIFIED beyond the owner's report. The findings below are the reviewer's text, unedited; the section "Resolution (Slice 6)" at the end was added afterwards by the Slice 6 agent.
Method: I read the code, tests, specs, docs, hooks, workflows and `git log`. I ran the gates below myself. I did not use any author narrative as evidence. No file other than this one was written. Nothing was committed. The only side effects are ignored caches in `node_modules/` and a temporary build folder that was deleted.

## Gate results (my own runs, 2026-11-19, Windows, free RAM 2.3 GiB, above the 2 GiB gate)

| Gate | Result | Evidence |
|---|---|---|
| `npm run typecheck` | PASS | exit 0 |
| `npm test` | PASS | exit 0, 14 files, 133 tests |
| `vite build` (to a temp folder, so `dist/` was not touched) | PASS | exit 0, 30 modules, JS 244.37 kB |
| Playwright E2E (`e2e/*.spec.ts`) | NOT RUN | CI only by project rule. Specs were read, not executed. |
| GitHub Actions results (`verify`, `e2e`, `Pages`) | NOT VERIFIED | `gh` is not logged in here. Docs say "reported by the orchestrator". |
| Live demo URL | NOT VERIFIED | No network check was made. |
| Hook execution (both hooks) | NOT RUN | Never observed to fire according to the log. I did not test it. |
| Custom reviewer agent as a separate documented run | NOT RUN | No session ID is available to me. |
| Symlink or junction escape of the CLI/MCP file confinement | NOT RUN | No test exists and I did not create a link in the repo. |
| Existing tests edited or deleted | PASS | `git log --diff-filter=MD -- tests src/engine src/lib` is empty. |
| `src/engine` and `src/lib` changed after creation | PASS | Same command: no modification or deletion since the commits that created them. |

## Findings

### HIGH

**H1. The redaction is a key-name denylist and misses common secret and card keys.** `src/lib/redact.ts` (`SENSITIVE_PARTS`, line 4) matches only `token, secret, cookie, authorization, apikey, cardnumber, signature`.
I ran `redact` on a payload: `password, private_key, signing_key, cvv, card, pan, session, bearer, credentials, hmac` all came out unchanged, and so did `note: "Bearer abc.def.ghi"`. Values are never inspected.
`product.md` says exports must never contain "signature keys, tokens, card data, cookies or private event bodies", and the README sells a "sanitized regression fixture". The export (`buildExportFile`) keeps every other payload field. `title`, `eventId` and `checkoutId` are never redacted, and they also go into the repair spec and the CLI output.
`tests/lib/redact.test.ts` and `tests/lib/exportBundle.test.ts` only test the seven listed fragments, so they cannot catch this. Fix by widening the list (`password`, `passwd`, `key`, `cvv`, `cvc`, `card`, `pan`, `session`, `bearer`, `credential`, `hmac`), or by switching to an allowlist of known payload fields.

**H2. `docs/KIRO_USAGE.md` says Kiro called all three MCP tools. The evidence shows two.** Line 18: "Kiro called all three." `docs/evidence/mcp-calls.md` has three calls: `replay_incident` twice and `diff_runs` once. `export_regression` was never called. The "Three real calls recorded" cell is true, but the sentence beside it is not. This is the document judges use to score Kiro usage, so the overclaim should be fixed first. Either record a real `export_regression` call or change the wording to "two of three tools".

### MEDIUM

**M1. Redaction can turn a hard conflict into a PASS after export and re-import.** I ran this: two events with the same `eventId` whose payloads differ only in `signature` ("AAA" vs "BBB"). Replay of the original: `halted=true, pass=false` (hard conflict, correct). Export, then import, then replay: `halted=false, pass=true`.
Cause: `canonicalEventContent` (`src/engine/identity.ts`) includes payload values, and `redact` replaces them with `[REDACTED]` before the conflict check runs on the re-imported file. This contradicts "Same-ID/different canonical content is always a hard conflict" and "export/reimport must preserve or restore" for such inputs. `docs/KIRO_LOG.md` (Slice 3, decision 4) admits the fingerprint changes but not that the verdict can flip. A regression fixture that flips FAIL to PASS is worse than one that refuses to export. Fix: when redaction changes content, refuse export or warn, or run the conflict check before redaction and carry the result.

**M2. Commit attribution cannot be verified from git, and one claim contradicts the log.** Every commit has the same author and committer (`lunauulu-lang`), including the `docs: add Slice N Kiro prompt` commits. `docs/KIRO_USAGE.md` line 7 says commits with the `kiro:` prefix "are Kiro's" and that Kiro "pushed the slice branches". The prefix is only a convention. The Slice 1 log entry says "NOT done: ... push/PR", so Kiro did not push that branch. The "Verified in git" state in the Specs row (line 15) proves only that a file exists in a commit, not who wrote it. Mark this NOT VERIFIED, or cite session IDs. Slices 0 to 2 have none.

**M3. The public Kiro log and evidence docs contradict the current state.**
- `docs/KIRO_LOG.md` lines 3 to 4 still say "NO KIRO MODEL IMPLEMENTATION RUN RECORDED". The run ledger row says NOT RUN. The test gate table says NOT RUN for golden tests, build, hook, MCP and the judge URL. Real entries follow further down.
- `docs/SUBMISSION_AND_EVIDENCE.md` says the repo is NOT CREATED, NOT PUBLISHED and NOT DEPLOYED, with RAM "~1.1 GiB".
- `docs/TEST_MATRIX.md` is headed "proposed, NOT RUN".
- `README.md` (Files section) still calls `KIRO_LOG.md` "initially NOT RUN", `.kiro/agents/` "proposed", and says the CLI/MCP bridge "comes only after the browser demo is verified".
These stale statements are conservative, but a judge will see conflicting facts about the same repository. Add a dated "superseded by the run entries below" note or update the tables.

**M4. CLI and MCP confinement is relative to the working directory, not the repository, and it is auto-approved.** `cli/node-io.ts` takes `realpathSync(process.cwd())` as the root. `.kiro/settings/mcp.json` has no `cwd`, so the root is whatever directory Kiro launches the server from. `npm run ghosttrace` run from a parent folder would widen the root. The README and KIRO_USAGE say "inside the repository".
The same file sets `autoApprove` for all three tools. Any readable file under that root (for example `.git/config`) can be parsed without a prompt. Parse errors do not echo file content, which limits the damage. Pin the root to the package directory (for example from `import.meta.url`) and consider removing `autoApprove` for `export_regression`.
The spec (`.kiro/specs/ghosttrace-release/requirements.md`, R2) and the code comment promise that a symlink out is rejected. `tests/cli/paths.test.ts` has no symlink or junction case. `realpathSync` should handle it, but it is untested (NOT RUN).

**M5. Engine purity is not enforced by any test.** The code is pure on reading: no clock, no randomness, no I/O in `src/engine` or `src/lib`. I grepped for `Date.now`, `new Date()`, `Math.random`, `fetch`, storage and `eval`, with no hits in `src/`, `cli/` or `mcp/` beyond the intended file reads in `cli/node-io.ts`. But `tests/release/paths.test.ts` only blocks `fetch(`, `XMLHttpRequest` and root-absolute `url()`. It misses `WebSocket`, `EventSource`, `sendBeacon`, `Date.now`, `Math.random` and `import()`. The e2e request log helps, but it is CI-only. Add one static test over `src/engine` and `src/lib`.

**M6. Golden tests check a subset of violation codes, and the property tests are narrow.**
- `tests/engine/golden.test.ts` asserts that each required code is present, not that the set is exact, except when the expected list is empty. An extra spurious violation in G000 to G110 would pass.
- `tests/engine/properties.test.ts` only permutes the four fixture events and adds identical retries. There is no generator for amounts, currencies, mixed checkouts or conflicting IDs. Integer-money behavior is covered by example tests only.

**M7. The usage doc omits the second hook and the pipeline overclaims "each slice".** `docs/KIRO_USAGE.md` describes only `engine-tests.json`. Commit c78aa14 added `.kiro/hooks/test-on-ts-save.json`, and its non-firing is recorded in the log, not in the usage doc. Both hooks fire on the same trigger, so if they ever do fire, tests run twice. Line 21 says Kiro planned "each slice" in its own spec, but Slices 0 and 1 used the ChatGPT-authored spec, as the same document says elsewhere. The polish spec lists "Reviewer agent run and fixes (R3)" as pending. This file is its output, and it has not yet been recorded in `KIRO_LOG.md`.

### LOW

- **L1. Money sums are not bounded.** `schema.ts` accepts any positive safe integer. `evaluate` (`src/engine/invariants.ts`) adds without a guard. I ran a total of 2^53-1 with two such captures: `captured=18014398509481982`, which is above the safe-integer range. The `capture_over_total` violation is still raised, so the verdict is right, but the reported number is not exact. Add an upper bound for money, or a check for a safe sum.
- **L2. `canonicalJson` caps at depth 64 and returns `"[too-deep]"`.** Two different deep payloads would then compare equal. It is unreachable through `validateBundle` (limit 32). `replay` is documented as taking validated input only, so keep that contract visible.
- **L3. Misleading error for large inputs.** `measureValueDepth` returns Infinity after 200 000 nodes, which `validateBundle` reports as `too_deep`.
- **L4. `readTextFile` leaks existence.** A missing path returns "Cannot read file" while an existing path outside the root returns "outside the repository". This lets a caller probe for files outside the repo. Use one message for both.
- **L5. CLI exit code is 0 for FAIL.** This is documented in the README and tested, but it means the CLI cannot gate a CI step. Consider an opt-in `--strict`.
- **L6. `inputHash` is a 53-bit non-cryptographic fingerprint** (cyrb53). This is documented. `compareReplays` trusts it to decide "same bundle". Collisions are unlikely for this use but possible.
- **L7. Imported text flows into the downloadable "Kiro repair spec".** `buildRepairSpec` writes `bundle.title` and engine messages (which include `eventId` and `checkoutId`) into Markdown that is meant to be fed to an agent. Newlines and pipes are escaped, but the content is untrusted data. Treat that file as input, not instructions.
- **L8. Reviewer agent config.** `.kiro/agents/ghosttrace-reviewer.md` grants `shell` while saying "no writes". Read-only is enforced only by the prompt.
- **L9. Workflow hygiene.** Actions use tags (`@v4`), not commit SHAs. `Pages` deploys without running tests, and it is manual-only. Add `npm audit --omit=dev` to CI, because the audit was run once, locally.
- **L10. `docs/KIRO_USAGE.md` cites "Pull requests #1 to #5".** History also has PR #6 (`85e0f55`, Slice 5). README correctly says Slices 0 to 5 are merged.
- **L11. Dependency policy.** `package.json` pins caret ranges on very recent majors (typescript ^7, vitest ^5, vite ^8, zod ^4). They install and pass here. `package-lock.json` is the real pin.

## Checked and found sound

- **Duplicate and conflict semantics.** `detectConflicts` and `replay` halt on same-ID, different-content events before any execution, for every config (F08, all 8 configs tested). Idempotency is applied-only: `applied.add` runs only when `!result.rejected`, and G100, G101 and F07b prove a rejected d1 does not reserve the key. Ordering is explicit (`TYPE_RANK`, then `deliveryIndex`); `occurredAt` is never used.
- **Immutable input.** `replay`, `orderDeliveries` (copy before sort), `evaluate`, `redact` and the export builders do not mutate. Deep-frozen inputs are tested in properties, identity and redact tests.
- **Integer money.** The schema rejects floats, negatives, zero, strings and missing or wrong currency. Unknown amounts are never coerced to zero (`resolveLegacyAmount`).
- **Bounds.** 1 MiB, 500 events, depth 32 and 16 384 characters per event are enforced before and after parse. Depth is measured iteratively, so there is no stack risk.
- **Golden values.** G110 captures 9800 and G111 captures 4900, in the engine tests, the CLI tests and the recorded MCP output. These match `docs/TEST_MATRIX.md`.
- **Claims about simulated fixes.** The UI badge, CLI footer and repair spec say "synthetic" and "no real payment". The code makes no production claim.
- **Network and storage.** No `fetch`, storage, cookies or external URLs in `src/`, `cli/` or `mcp/`. The CLI and MCP only read files, with a 1 MiB size check before the read. The path check is pure and tested for sibling look-alikes (`/repo-other`) and Windows case.
- **Tests were not weakened.** Git history shows no edits or deletions of any file under `tests/`.
- **Honest markers already in the docs.** NOT OBSERVED for both hooks, NOT RUN for the reviewer in Slice 3, "reported by the orchestrator" for CI and Pages, and NOT VERIFIED for credits. These match the code and log.

## Limits of this review

I did not execute Playwright, check CI or the live site, test hooks, or test symlink escape. I did not read every UI test or `src/styles.css`. The numbers above are from my own runs on this host and may differ elsewhere.

## Resolution (Slice 6, added by the Slice 6 agent after the review)
Owner decisions applied: widen redaction, try a real `export_regression` MCP call, fix stale wording, add a symlink test if simple.

### Fixed
- **H1 (redaction keys), partly.** `src/lib/redact.ts` now also redacts keys containing `password`, `passwd`, `privatekey`/`private_key`, `hmac`, `session` (anywhere in the normalized key) and the whole words `cvv`, `cvc`, `card`, `pan` (so `company`, `panel` and `discard` stay readable). `signature` and `cookie` were already covered. New tests are in `tests/lib/redactExtended.test.ts` (4 tests); no existing test was edited. Not added, because the owner's list did not include them: `bearer`, `credential`, `key`, `signing_key`, and an allowlist design. Values are still never inspected.
- **H2 (MCP overclaim).** I could not make an `export_regression` MCP call. The `ghosttrace` MCP tools are not exposed to this agent session (`load_resource` for `tool::ghosttrace::export_regression` was rejected as not in the catalogue), and I did not substitute a shell run or invent output. `docs/evidence/mcp-calls.md` is unchanged. `docs/KIRO_USAGE.md` now says two of three tools were called for real.
- **M2 (attribution).** `docs/KIRO_USAGE.md` now says git cannot show authorship, the `kiro:` prefix is a convention, and some pushes were done by the owner. Marked NOT VERIFIED from git alone.
- **M3 (stale wording).** Superseded notes or updated rows in `docs/KIRO_LOG.md` (top status), `docs/SUBMISSION_AND_EVIDENCE.md` (proof register), `docs/TEST_MATRIX.md` (title) and `README.md` (Files section). Statuses that rest on the owner or orchestrator are labelled so.
- **M4 (symlink test), partly.** `tests/cli/symlink.test.ts` creates a junction/symlink inside the working directory that points outside and checks that `readTextFile` rejects it. It passes on this Windows host (a junction was created; if linking is not allowed the test skips).
- **M7 (usage doc), partly.** The second hook and its non-firing are documented; "each slice" is corrected to Slices 2 to 6.
- **L10.** PR #6 is now mentioned.

### Not fixed
| Finding | Reason |
|---|---|
| H1: `bearer`, `credential`, `key`, `signing_key`, value inspection, allowlist | Outside the owner's key list. An allowlist is a design change to the export contract. |
| M1 redaction can flip a hard conflict to PASS after re-import | Needs a change to export or import semantics in `src/lib`. The owner allowed only key-list changes in `redact.ts`. Worth a spec of its own. |
| M4: pin the root to the package directory; drop `autoApprove` for `export_regression` | Changes behavior of `cli/` and `.kiro/settings/mcp.json`, and the owner did not ask for it. The symlink test is added. |
| M5 static purity test | Not high severity; new test scope not requested. |
| M6 golden exactness and wider property tests | Existing tests must stay unchanged; a larger new generator suite is outside this slice. |
| L1 to L9, L11 | Low severity. L1 and L2 are engine behavior (`src/engine/**` is frozen). L4 to L5 change CLI behavior. L9 changes CI and was not requested. |
