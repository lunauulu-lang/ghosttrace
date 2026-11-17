# Kiroween 2026 — submission evidence gates

Reference: https://kiroween.devpost.com/ and https://kiroween.devpost.com/rules
Latest organizer deadline visible: **2026-12-04 14:00 PST = 2026-12-05 04:00 Bishkek**.
Verify source on the signed-in 2026 Devpost contest before final submission; old/cached 2025 rules may appear in public search tools.

## Source-backed status as of 2026-11-17
- Devpost registration: owner-reported completed (individual).
- Kiroween 4,000 bonus credits: browser-Claude observed `kiroween2026: 0 / 4000 used`, same Google identity as local Kiro Crew; Free plan `0.11 / 50`. Browser-Claude report, **not an independent API audit**.
- Owner explicitly authorized using included Free and bonus credits; Pro purchase and paid overage not authorized.
- Windows: Crew 0.12.2, host KAS preflight reportedly PASS but **no Kiro model coding run**.
- Free memory during last check: ~1.1 GiB, critically below Crew's 2 GiB warning threshold. Run Slice 0 only after safety gate.
- GitHub PR #7 holds **staging plan only**. This is NOT a contest app; unrelated factory CI green runs do not verify GhostTrace.
- CLAUDE ARCHITECTURE REVIEW in Issue #8 confirmed five improvement areas; revised architecture: static Vite/React/TS, applied-only idempotency, eight golden outcomes, independent contest CI.
- A dedicated contest repository is NOT YET CREATED. Copy contents of `ghosttrace/` to its root, including `.kiro` and `LICENSE`, only after owner authorizes creation. Do not copy private AI Software Factory or EvidencePulse history.

## Proof register (update only after real evidence)

| Gate | Status | Evidence needed |
|---|---|---|
| Credits & Kiro identity | REPORTED CONFIRMED | Recheck account balance before model call |
| KAS preflight | REPORTED PASS | Sanitized host preflight record |
| RAM >= 2GiB before model | NOT VERIFIED | Fresh Windows available-memory reading |
| Dedicated PRIVATE contest repo | NOT CREATED | URL, root .kiro and LICENSE |
| Windows Git commit/push/fetch to contest repo | NOT RUN | Matching remote SHA |
| First real Kiro engine Slice 0 | NOT RUN | Session/run ID, source SHA, tests, balance delta |
| Golden matrix G000–G111 | NOT RUN | Real unit test logs tied to SHA |
| Browser UI / safe import / export / reimport | NOT RUN | E2E browser logs / CI |
| Full contest CI (typecheck/tests/build/Playwright) | NOT RUN | Exact GitHub Actions job on submitted SHA |
| Kiro-native usage evidence | NOT RUN | Actual meaningful Kiro actions, no fabricated sessions |
| Optional CLI / MCP | NOT RUN | Real executable command/tool call (only if implemented) |
| Public website & judge URL | NOT DEPLOYED | Clean-browser run and reproducible install |
| Public OSS GitHub with root /.kiro | NOT PUBLISHED | Repo URL, recognized OSI license |
| English public demo video (<3m) | NOT MADE | Public video link showing the working app |
| Devpost GhostTrace submission | NOT SUBMITTED | Submitted entry URL and state |
| Prize payment availability | UNKNOWN | Organizer/prize provider written process |

## Final-entry checklist
1. Confirm **2026** eligibility/category Frankenstein and actual submission window on the current contest entry page.
2. Public GitHub contest repo, root `/.kiro`, detectable OSI LICENSE, installation/test instructions.
3. Guest demo link works without auth or paid keys; never make real payment/webhook calls.
4. Demonstrate actual G000 failure -> G110 synthetic overcapture -> G111 success -> redacted export/reimport.
5. All five official judging dimensions addressed: potential impact, technological implementation with Kiro, design, innovation, presentation. No claim of tested features without matching evidence.
6. English write-up and public video under three minutes with app actually running. Record truthful Kiro usage, review alternatives/experiments.
7. Owner approves repo publication, deployment and final Devpost submission separately. Aim to submit by Dec 3 for buffer; final hard deadline Dec 5 04:00 Bishkek.
8. Keep judge access open for the required judging period; verify specific 2026 end date against the current signed-in rules.

## Evidence integrity
All pre-Kiro specs, log templates and fixture were prepared by ChatGPT/Claude or the owner. Actual Kiro contribution starts only at a witnessed model execution and code changes. Mark PASS / FAIL / NOT RUN; record exact GitHub SHA; never confuse unrelated root factory checks with contest app checks.
